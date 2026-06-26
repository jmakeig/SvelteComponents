import { setup, assign, emit, createActor, fromPromise } from 'xstate';
import type { Actor, PromiseActorLogic } from 'xstate';
import type { Proposal } from './types.js';

type Context = {
	type_ahead: string;
	matches: Proposal[]; // TODO: Make this generic, e.g. `T extends Proposal`
	selection: number | null;
	value: Proposal | null;
};

type MachineEvent =
	| { type: 'activate' }
	| { type: 'deactivate' }
	| { type: 'oninput'; value: string }
	| { type: 'select'; selection: number }
	| { type: 'commit' };

type EmittedEvent = { type: 'selected'; value: string };

export const machine = setup({
	types: {} as {
		context: Context;
		events: MachineEvent;
		emitted: EmittedEvent;
		actors: { src: 'fetch_autocomplete'; logic: PromiseActorLogic<Proposal[], { search: string }> };
	},
	actors: {
		fetch_autocomplete: fromPromise(
			async ({ input: { search: _ } }: { input: { search: string } }): Promise<Proposal[]> => {
				throw new Error("shouldn't be reachable");
			}
		)
	},
	guards: {},
	delays: {}
}).createMachine({
	id: 'combo_box',
	context: {
		type_ahead: '',
		matches: [],
		selection: null,
		value: null
	},
	initial: 'idle',
	states: {
		idle: {
			on: {
				activate: [
					{
						target: 'active',
						actions: []
					}
				]
			}
		},
		active: {
			initial: 'eager',
			states: {
				eager: {
					description:
						'Eagerly fetches, avoiding debouncing. This is useful when reentering, for example re-activating with existing input.',
					always: [
						{
							target: 'searching.fetching',
							guard: ({ context }) => context.type_ahead.length > 2
						}
					]
				},
				waiting: {
					always: [
						{
							target: 'searching',
							guard: ({ context }) => context.type_ahead.length > 2
						}
					]
				},
				searching: {
					initial: 'debouncing',
					entry: [assign({ matches: (): Proposal[] => [], selection: (): null => null })],
					states: {
						debouncing: {
							after: {
								500: {
									target: 'fetching'
								}
							}
						},
						fetching: {
							invoke: {
								src: 'fetch_autocomplete',
								input: ({ context }) => ({
									search: context.type_ahead
								}),
								onDone: {
									target: '#combo_box.active.proposing',
									actions: [
										assign({
											matches: ({ event }) => event.output,
											selection: null
										})
									]
								},
								onError: {
									//target: 'error'
								}
							}
						}
					}
				},
				proposing: {
					on: {
						select: [
							{
								target: 'proposing',
								actions: [assign({ selection: ({ event }) => event.selection })]
							}
						],
						commit: [
							{
								target: 'committed',
								actions: [
									assign({
										value: ({ context }) => context.matches[context.selection!],
										type_ahead: ({ context }) => context.matches[context.selection!].name
									})
								]
							}
						]
					}
				},
				committed: {
					entry: [
						emit(({ context }) => ({ type: 'selected' as const, value: context.value!.value }))
					]
				},
				error: {
					//TODO
				}
			},
			on: {
				deactivate: [
					{
						target: 'idle',
						actions: []
					}
				],
				oninput: [
					{
						target: '#combo_box.active.waiting',
						actions: [assign({ type_ahead: ({ event }) => event.value })],
						reenter: true
					}
				]
			}
		}
	}
});

export function create_actor(
	get_matches: (query: string) => Promise<Proposal[]>
): Actor<typeof machine> {
	return createActor(
		machine.provide({
			actors: {
				fetch_autocomplete: fromPromise(
					async ({ input: { search } }: { input: { search: string } }): Promise<Proposal[]> => {
						return get_matches(search);
					}
				)
			}
		})
	);
}
