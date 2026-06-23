<!--
	TODO:
		✅ Implement render logic for list items and value.
		* Add “Create XXX…” for new itemsl
		✅ Refactor into proper Svelte component
		✅ Refactor machine to inject actor and action implementations
		✅ Cancel hanlder (esc, click outside)
    ✅ Use aria-selected instead of focus
-->

<script lang="ts" generics="T extends Proposal">
	import type { Snippet } from 'svelte';
	import type { SnapshotFrom } from 'xstate';
	import type { Proposal } from './types.js';
	import { create_actor, machine } from './machine.js';

	interface Props {
		name: string;
		search: (query: string) => Promise<T[]>;
		debug?: 'true' | 'false' | boolean;
		item?: Snippet<[T]>;
	}

	let { name, search, debug: _debug = false, item }: Props = $props();
	let debug = $derived(true === _debug || 'true' === _debug);
	const component_id = $props.id();

	// svelte-ignore state_referenced_locally
	const actor = create_actor(search).start();
	let snap = $state(actor.getSnapshot());
	let history = $state([] as Array<{ snapshot: SnapshotFrom<typeof machine>; timestamp: Date }>);

	actor.subscribe((snapshot) => {
		snap = snapshot;
		history = [{ snapshot, timestamp: new Date() }, ...history];
	});
	actor.on('selected', (evt) => console.log('selected', evt));

	function handle_keydown_select(evt: KeyboardEvent): void {
		switch (evt.key) {
			case 'ArrowDown':
				console.log('arrow down, yo!');
				actor.send({
					type: 'select',
					selection: Math.min(
						Math.max(0, snap.context.matches.length - 1),
						(snap.context.selection ?? -1) + 1
					)
				});
				evt.preventDefault();
				break;
			case 'ArrowUp':
				actor.send({ type: 'select', selection: Math.max(0, (snap.context.selection ?? 0) - 1) });
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

	function create_handle_click_select(index: number): () => void {
		return function handle_click_select() {
			actor.send({ type: 'select', selection: index });
			actor.send({ type: 'commit' });
			actor.send({ type: 'deactivate' });
		};
	}

	function click_outside(
		node: HTMLElement,
		callback: (evt: MouseEvent) => void
	): { destroy(): void } {
		function handle_click(evt: MouseEvent) {
			if (!node.contains(evt.target as Node | null)) {
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

	function blur_on_idle(node: HTMLElement): void {
		$effect(() => {
			if (snap.matches('idle')) node.blur();
		});
	}
</script>

<div
	use:click_outside={(evt) => {
		if (!snap.matches('idle')) actor.send({ type: 'deactivate' });
	}}
	style="display: inline-grid; align-items: center; position: relative;"
>
	<input
		type="text"
		id={name /* This allows label/@for to work */}
		role="combobox"
		aria-label="Color"
		aria-autocomplete="list"
		aria-haspopup="listbox"
		aria-activedescendant={null !== snap.context.selection
			? 'proposal_' + String(snap.context.selection)
			: undefined}
		aria-expanded={snap.matches({ active: 'proposing' })}
		aria-controls="proposals"
		spellcheck="false"
		autocorrect="off"
		autocapitalize="off"
		autocomplete="off"
		value={snap.context.type_ahead}
		onfocus={(evt) => actor.send({ type: 'activate' })}
		oninput={(evt) =>
			actor.send({ type: 'oninput', value: (evt.target as HTMLInputElement).value })}
		onkeydown={handle_keydown_select}
		use:blur_on_idle
		style="grid-area: 1/1;"
	/>
	{#if snap.matches({ active: 'searching' })}
		<div class="search_spinner" style="grid-area: 1/1; justify-self: end; padding-right: 0.25em;">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="1em"
				height="1em"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="spinning icon icon-tabler icons-tabler-outline icon-tabler-rotate-clockwise"
			>
				<path stroke="none" d="M0 0h24v24H0z" fill="none" />
				<path d="M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5" />
			</svg>
		</div>
	{/if}
	<input type={debug ? 'text' : 'hidden'} {name} value={snap.context.value?.value} />
	<ol
		id="proposals"
		role="listbox"
		aria-label="Items"
		hidden={!snap.matches({ active: 'proposing' })}
	>
		{#each snap.context.matches as match, i}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<li
				role="option"
				id={'proposal_' + String(i)}
				aria-selected={i === snap.context.selection}
				onclick={create_handle_click_select(i)}
				class="interactive"
			>
				{#if item}{@render item(match as T)}{:else}{match.label}{/if}
			</li>
		{/each}
	</ol>
	<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
		{#if snap.matches({ active: 'searching' })}
			Loading…
		{:else if snap.matches({ active: 'proposing' }) && 0 === snap.context.matches.length}
			No results
		{/if}
	</div>
</div>

{#if debug}
	<div
		id={'history_' + component_id}
		style="background: #ddd; padding: 0.5em; max-height: 12em; overflow: auto;"
	>

		<h1 style="font-family: monospace; margin: 0.5em 0;">{JSON.stringify(snap?.value)}</h1>
		<details open style="margin-top: 1em; padding: 1em; border: solid 1px #ccc;">
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
						event.timestamp.getTime() -
						history[Math.min(history.length - 1, i + 1)].timestamp.getTime()}
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
		/* box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); */
		box-shadow:
			rgba(0, 0, 0, 0.1) 0px 4px 6px -1px,
			rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;
		background-color: #fff;
	}
	#proposals > li {
		padding: 0.5em;
		border-bottom: solid 0.5px hsl(from currentColor h s 75%);
		border-top: solid 0.5px hsl(from currentColor h s 95%);
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

	@keyframes spin {
		to {
			transform: rotate(1turn);
		}
	}
	.spinning {
		animation: spin 0.75s linear infinite;
	}
</style>
