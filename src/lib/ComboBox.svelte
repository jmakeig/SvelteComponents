<!--
	TODO:
		* Refactor into proper Svelte component
		* Refactor machine to inject actor and action implementations
		✅ Cancel hanlder (esc, click outside)
    ✅ Use aria-selected instead of focus
-->

<script>
	import { create_actor } from './machine.js';

	let { name, search, debug = false } = $props();

	// svelte-ignore state_referenced_locally
	const actor = create_actor(search).start();
	let state = $state(actor.getSnapshot());
	let history = $state([]);

	actor.subscribe((snapshot) => {
		state = snapshot;
		history = [{ snapshot: actor.getPersistedSnapshot(), timestamp: new Date() }, ...history];
	});
	actor.on('selected', (evt) => console.log('selected', evt));

	function handle_keydown_select(evt) {
		switch (evt.key) {
			case 'ArrowDown':
				console.log('arrow down, yo!');
				actor.send({
					type: 'select',
					selection: Math.min(
						Math.max(0, state.context.matches.length - 1),
						(state.context.selection ?? -1) + 1
					)
				});
				evt.preventDefault(); // Prevent scrolling (but what if the list needs to scroll?)
				break;
			case 'ArrowUp':
				actor.send({ type: 'select', selection: Math.max(0, state.context.selection - 1) });
				evt.preventDefault();
				break;
			case 'Enter':
				actor.send({ type: 'commit' });
				actor.send({ type: 'deactivate' });
				break;
			case 'Escape':
				actor.send({ type: 'deactivate' });
				break;
			default:
			// console.log(evt.key);
		}
	}

	function create_handle_click_select(index) {
		return function handle_click_select(evt) {
			actor.send({ type: 'select', selection: index });
			actor.send({ type: 'commit' });
			actor.send({ type: 'deactivate' });
			// evt.preventDefault();
			// evt.stopPropagation();
		};
	}

	// Actions
	function click_outside(node, callback) {
		function handle_click(evt) {
			if (!node.contains(evt.target)) {
				callback(evt);
			}
		}
		document.addEventListener('click', handle_click, true);
		return {
			destroy() {
				document.removeEventListener('click', handle_click, true);
			}
		};
	}
	function blur_on_idle(node) {
		$effect(() => {
			if (state.matches('idle')) node.blur();
		});
	}
</script>

<div
	use:click_outside={(evt) => actor.send({ type: 'deactivate' })}
	style="display:inline-block; width: fit-content; position: relative;"
>
	<!-- <button
		onclick={evt => actor.send({type:"oninput", value: _type_ahead?.value})}
		disabled={!state.can({type: "oninput"})}>Input</button> -->
	<input
		type="text"
		{name}
		role="combobox"
		aria-label="Color"
		aria-autocomplete="list"
		aria-haspopup="listbox"
		aria-activedescendant={null !== state.context.selection
			? 'proposal_' + String(state.context.selection)
			: undefined}
		aria-expanded={state.matches({ active: 'proposing' })}
		aria-controls="proposals"
		spellcheck="false"
		autocorrect="off"
		autocapitalize="off"
		autocomplete="off"
		value={state.context.type_ahead}
		onfocus={(evt) => actor.send({ type: 'activate' })}
		oninput={(evt) => actor.send({ type: 'oninput', value: evt.target.value })}
		onkeydown={handle_keydown_select}
		use:blur_on_idle
	/>
	<ol
		id="proposals"
		role="listbox"
		aria-label="Items"
		hidden={!state.matches({ active: 'proposing' })}
	>
		{#each state.context.matches as match, i}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<li
				role="option"
				id={'proposal_' + String(i)}
				aria-selected={i === state.context.selection}
				onclick={create_handle_click_select(i)}
				class="interactive"
			>
				{match.label}
			</li>
		{/each}
	</ol>
	<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
		{#if state.matches({ active: 'searching' })}
			Loading…
		{:else if state.matches({ active: 'proposing' }) && 0 === state.context.matches.length}
			No results
		{/if}
	</div>
</div>

{#if debug}
	<div
		style="position: absolute; z-index: 10; top: 0; right: 0; width: 33%; height: 40em; overflow: auto; background: #ddd; padding: 0.5em;"
	>
		<h1 style="font-family: monospace; margin: 0.5em 0;">{JSON.stringify(state?.value)}</h1>
		<details open="open" style="margin-top: 10em; padding: 1em; border: solid 1px #ccc;">
			<summary>History</summary>
			<button onclick={(evt) => (history = [])}>Clear</button>
			<nav>
				<ol style="list-style: none; padding: 0; margin: 0; display: flex; gap: 1em;">
					{#each history as event, i}
						<li style=""><a href={'#history_' + (i + 1).toString()}>{i + 1}</a></li>
					{/each}
				</ol>
			</nav>
			<div style="font-family: monospace; font-size: 1.1em; margin: 0.5em 0;">
				{#each history as event, i}
					{@const elapsed =
						event.timestamp - history[Math.min(history.length - 1, i + 1)].timestamp}
					<details
						id={'history_' + (i + 1).toString()}
						style="padding: 0.25em; border: solid 0.5px #ccc;"
					>
						<summary>
							<div style="display: inline-flex; width: calc(100% - 20px);">
								<div style="flex-grow: 1;">{JSON.stringify(event?.snapshot.value)}</div>
								<div style="width: fit-content; flex-shrink: 0;">
									{elapsed > 0 ? '+' : elapsed < 0 ? '-' : ''}{Math.abs(elapsed).toLocaleString()}ms
								</div>
								<!-- <div>({event.timestamp.toISOString()})</div> -->
							</div>
						</summary>
						<div>
							<pre>{JSON.stringify(event?.snapshot, null, 2)}</pre>
						</div>
					</details>
				{/each}
			</div>
		</details>
	</div>
{/if}

<style>
	#proposals {
		position: absolute;
		z-index: 1;
		top: 100%;
		left: 0;
		min-width: 100%;
		margin: 0;
		padding: 0;
		list-style: none;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
	}
	#proposals > li {
		padding: 0.5em;
	}
	li[aria-selected='true'] {
		outline: auto 5px -webkit-focus-ring-color;
	}
	.interactive {
		cursor: default;
	}

	/* Screen reader only. Moves the content offscreen, but doesn’t hid it. */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
