import { setup, assign, emit, createActor, fromPromise } from 'xstate';
import type { PromiseActorLogic } from 'xstate';

export interface Match {
	name: string;
	label?: string;
	value: string;
}

type MachineEvent =
	| { type: 'activate' }
	| { type: 'deactivate' }
	| { type: 'oninput'; value: string }
	| { type: 'clear' }
	| { type: 'select'; selection: number }
	| { type: 'commit' };

type EmittedEvent = { type: 'selected'; value: string };

function create_machine<T extends Match>() {
	type Context = {
		type_ahead: string;
		matches: T[];
		selection: number | null;
		value: T | null;
	};

	return setup({
		types: {} as {
			context: Context;
			input: { value?: T | null };
			events: MachineEvent;
			emitted: EmittedEvent;
			actors: { src: 'fetch_autocomplete'; logic: PromiseActorLogic<T[], { search: string }> };
			actions: { type: 'focus_input' };
		},
		// Override actions, actors, guards, and delays in machine.provide()
		actions: {
			focus_input: () => {}
		},
		actors: {
			fetch_autocomplete: fromPromise(
				async ({ input: { search: _ } }: { input: { search: string } }): Promise<T[]> => {
					throw new Error("shouldn't be reachable");
				}
			)
		},
		guards: {},
		delays: { debounce_delay: 0 }
	}).createMachine({
		id: 'combo_box',
		context: ({ input }) => ({
			type_ahead: input.value?.name ?? '',
			matches: [] as T[],
			selection: null,
			value: input.value ?? null
		}),
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
						entry: [assign({ selection: (): null => null })],
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
										target: '#combo_box.active.error',
										actions: [({ event }) => console.error(event.error)]
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
					error: {}
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
}

export function create_actor<T extends Match>(
	get_matches: (query: string) => Promise<T[]>,
	focus_input: () => void = () => {},
	debounce = 200,
	initial_value: T | null = null
) {
	return createActor(
		create_machine<T>().provide({
			actors: {
				fetch_autocomplete: fromPromise(
					async ({ input: { search } }: { input: { search: string } }): Promise<T[]> => {
						return get_matches(search);
					}
				)
			},
			actions: { focus_input },
			delays: { debounce_delay: debounce }
		}),
		{ input: { value: initial_value } }
	);
}
