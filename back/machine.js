import { setup, createMachine, assign, emit, createActor, fromPromise } from 'xstate';
import { get_colors } from './data.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const machine = setup({
	actions: {
		update_type_ahead: assign({
			type_ahead: ({ event }) => event.value
		}),
		update_selection: assign({
			selection: ({ event }) => event.selection
		}),
		clear_proposal: assign({
			matches: [],
			selection: null
		}),
		do_commit: assign({
			value: ({ context }) => context.matches[context.selection]
		})
	},
	actors: {
		fetch_autocomplete: fromPromise(async ({ input: { search }, signal }) => {
			/*
				const response = await fetch(`https://httpbin.org/delay/3`, { signal });
	      if (!response.ok) {
	        throw new Error('Network response failed'); //?
	      }
	      return response.json();
				*/
			await delay(100);
			// return ['0: ' + search, '1: ' + search, '2: ' + search, '3: ' + search];
			return get_colors(search);
		})
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
					entry: ['clear_proposal'],
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
											matches: ({ event }) => event.output, // 'output' is the fixed name of the invoker response
											selection: null // Clear the selection when the results change
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
								actions: [{ type: 'update_selection' }]
							}
						],
						commit: [
							{
								target: 'committed',
								actions: [
									{ type: 'do_commit' }
									// raise({type: "deactivate"}) //?
								]
							}
						]
					}
				},
				committed: {
					entry: [emit(({ context }) => ({ type: 'selected', value: context.value.value }))]
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
						actions: [
							{
								type: 'update_type_ahead'
							}
						],
						reenter: true
					}
				]
			}
		}
	}
	/*
		on: {
			'*': {
				actions: () => console.error('Invalid transition attempted')
			}
		}
		*/
});

export const actor = createActor(machine).start();
