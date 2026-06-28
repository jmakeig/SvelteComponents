import { setup, assign, emit, createActor, fromPromise } from 'xstate';
import type { Actor, PromiseActorLogic } from 'xstate';
import type { Match } from './types.js';

type Context = {
	type_ahead: string;
	matches: Match[]; // TODO: Make this generic, e.g. `T extends Match`
	selection: number | null;
	value: Match | null;
};

type MachineEvent =
	| { type: 'activate' }
	| { type: 'deactivate' }
	| { type: 'oninput'; value: string }
	| { type: 'clear' }
	| { type: 'select'; selection: number }
	| { type: 'commit' };

type EmittedEvent = { type: 'selected'; value: string };

export const machine = setup({
	types: {} as {
		context: Context;
		events: MachineEvent;
		emitted: EmittedEvent;
		actors: { src: 'fetch_autocomplete'; logic: PromiseActorLogic<Match[], { search: string }> };
		actions: { type: 'focus_input' };
	},
	// Override actions, actors, guards, and delays in machine.provide()
	actions: {
		focus_input: () => {}
	},
	actors: {
		fetch_autocomplete: fromPromise(
			async ({ input: { search: _ } }: { input: { search: string } }): Promise<Match[]> => {
				throw new Error("shouldn't be reachable");
			}
		)
	},
	guards: {},
	delays: { debounce_delay: 0 }
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
					],
					actions: [
						assign({
							type_ahead: ({ context }) => context.value?.name ?? ''
						})
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
					entry: [assign({ matches: (): Match[] => [], selection: (): null => null })],
					states: {
						debouncing: {
							after: {
								debounce_delay: {
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
				],
				clear: [
					{
						actions: [
							assign({
								type_ahead: () => '',
								matches: () => [],
								selection: () => null
							}),
							'focus_input'
						]
					}
				]
			}
		}
	}
});

export function create_actor(
	get_matches: (query: string) => Promise<Match[]>,
	focus_input: () => void,
	debounce = 200
): Actor<typeof machine> {
	return createActor(
		machine.provide({
			actors: {
				fetch_autocomplete: fromPromise(
					async ({ input: { search } }: { input: { search: string } }): Promise<Match[]> => {
						return get_matches(search);
					}
				)
			},
			actions: { focus_input },
			delays: { debounce_delay: debounce }
		})
	);
}
