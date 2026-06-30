<!--
	TODO:
		* Think about relevance ranking: type-ahead matching weighted by recency, modified by the current user, etc.
		✅ Implement render logic for list items and value.
		* Add “Create XXX…” for new itemsl
		✅ Refactor into proper Svelte component
		✅ Refactor machine to inject actor and action implementations
		✅ Cancel hanlder (esc, click outside)
		✅ Use aria-selected instead of focus
-->

<script lang="ts" generics="T extends Match">
	import type { Snippet } from 'svelte';
	import type { SnapshotFrom } from 'xstate';
	import type { Match } from './machine.js';
	import type { Booleanish } from 'svelte/elements';

	import { create_actor } from './machine.js';

	/**
	 * Items can be rendered in the match list or as a value in the idle state.
	 * `'compact'` represents the latter.
	 */
	type RenderMode = 'compact';

	interface Props {
		/**
		 * The unique name of the form element that will be be sumitted as.
		 * This also does double duty as the `@id` of type-ahead `input` so that
		 * the `@for` works on the `label`.
		 */
		name: string;
		label: string;
		value?: T; // TODO
		/**
		 * The implementation of the ansync search. Takes the typeahead text and
		 * returns an array of matching matches. That’s generic so the consumer will
		 * work with strongly typed concrete types, not just the `Match` interface.
		 * @param query The typeahead text. Most implementations will likely want to
		 * @returns The ordered collection of proposed matches, extends `Match`.
		 * When there are no matches, just return `[]`.
		 */
		search: (query: string) => Promise<T[]>;
		/**
		 * Enables UI that tracks the history of the state machine
		 * as well as the hidden input that actually gets submitted.
		 */
		debug?: Booleanish;
		/**
		 * The snippet that implements the display of the matching match in the dropdown.
		 */
		item?: Snippet<[T, RenderMode?]>;
		disabled?: Booleanish;
		readonly?: Booleanish;
		placeholder?: string;
	}

	const {
		name,
		label,
		value,
		search,
		item = fallback_item,
		debug: _debug = false,
		disabled: _disabled = false,
		readonly: _readonly = false,
		placeholder = label
	}: Props = $props();

	const debug = $derived(true === _debug || 'true' === _debug),
		disabled = $derived(true === _disabled || 'true' === _disabled),
		readonly = $derived(true === _readonly || 'true' === _readonly);
	const component_id = $props.id();

	// svelte-ignore state_referenced_locally
	const actor = create_actor(search, () => document.getElementById(name)?.focus(), 120).start();
	let snap = $state(actor.getSnapshot());
	let history = $state([] as Array<{ snapshot: SnapshotFrom<typeof actor>; timestamp: Date }>);

	actor.subscribe((snapshot) => {
		snap = snapshot;
		if (debug) {
			/** Appends in reverse chronological order. */
			history = [{ snapshot, timestamp: new Date() }, ...history];
		}
	});
	actor.on('selected', (evt) => console.log('selected', evt));

	function handle_keydown_select(evt: KeyboardEvent): void {
		switch (evt.key) {
			case 'ArrowDown':
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
				void 0;
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

	function focus_on_mount(node: HTMLElement): void {
		node.focus();
	}
</script>

<div
	use:click_outside={(evt) => {
		if (!snap.matches('idle')) actor.send({ type: 'deactivate' });
	}}
	style="display: contents;"
>
	{#if snap.matches('idle')}
		<div class="field">
			<div class="inputish">
				{#if snap.context.value}
					{@render item(snap.context.value, 'compact')}
				{:else}
					{placeholder}
				{/if}
			</div>
			{#if !disabled && !readonly}
				<button
					type="button"
					title="Edit"
					onclick={(evt) => actor.send({ type: 'activate' })}
					class="action"
				>
					{@render icon_edit()}
				</button>
			{/if}
		</div>
	{:else if snap.matches('active')}
		<div class="field" style="position: relative;">
			<input
				type="text"
				id={name}
				role="combobox"
				aria-label={label}
				aria-autocomplete="list"
				aria-haspopup="listbox"
				aria-activedescendant={null !== snap.context.selection
					? 'match_' + String(snap.context.selection)
					: undefined}
				aria-expanded={snap.matches({ active: 'proposing' })}
				aria-controls={name + 'matches-' + component_id}
				value={snap.context.type_ahead}
				onfocus={(evt) => actor.send({ type: 'activate' })}
				oninput={(evt) =>
					actor.send({ type: 'oninput', value: (evt.target as HTMLInputElement).value })}
				onkeydown={handle_keydown_select}
				use:focus_on_mount
				use:blur_on_idle
				{disabled}
				{readonly}
				{placeholder}
				spellcheck="false"
				autocorrect="off"
				autocapitalize="off"
				autocomplete="off"
			/>
			{#if snap.matches({ active: 'searching' })}
				<span class="action search_spinner">
					{@render icon_spinner()}
				</span>
			{:else if snap.matches({ active: 'error' })}
				<span class="action error">
					{@render icon_error()}
				</span>
			{:else}
				<button
					type="button"
					title="Clear"
					onclick={(evt) => actor.send({ type: 'clear' })}
					disabled={!snap.context.type_ahead}
					class="action"
				>
					{@render icon_clear()}
				</button>
			{/if}
			<ol
				id={name + 'matches-' + component_id}
				role="listbox"
				aria-label="Items"
				class="listbox"
				hidden={!snap.matches({ active: 'proposing' }) && !snap.matches({ active: 'searching' })}
			>
				{#each snap.context.matches as match, i}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<li
						role="option"
						id={'match_' + String(i)}
						aria-selected={i === snap.context.selection}
						onclick={create_handle_click_select(i)}
						class="interactive"
					>
						{@render item(match)}
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
	{/if}
	<input type={debug ? 'text' : 'hidden'} {name} value={snap.context.value?.value} />
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

{#snippet icon_edit(width = '1em', height = '1em')}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		{width}
		{height}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="icon icon-tabler icons-tabler-outline icon-tabler-edit"
		><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
			d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1"
		/><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" /><path
			d="M16 5l3 3"
		/></svg
	>
{/snippet}

{#snippet icon_spinner(width = '1em', height = '1em')}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		{width}
		{height}
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
{/snippet}

{#snippet icon_clear(width = '1em', height = '1em')}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		{width}
		{height}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="icon icon-tabler icons-tabler-outline icon-tabler-xbox-x"
		><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
			d="M12 21a9 9 0 0 0 9 -9a9 9 0 0 0 -9 -9a9 9 0 0 0 -9 9a9 9 0 0 0 9 9"
		/><path d="M9 8l6 8" /><path d="M15 8l-6 8" /></svg
	>
{/snippet}

{#snippet icon_error(width = '1em', height = '1em')}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		{width}
		{height}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="icon icon-tabler icons-tabler-outline icon-tabler-exclamation-circle"
		><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
			d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"
		/><path d="M12 9v4" /><path d="M12 16v.01" /></svg
	>
{/snippet}

<!-- Defaul rendering for matches -->
{#snippet fallback_item(match: Match, mode?: string)}
	{match.name} ({match.value})
{/snippet}

<style>
	.field {
		display: grid;
		align-items: center;
	}
	.field > * {
		grid-area: 1/1;
	}
	.action {
		justify-self: end;
	}
	.action {
		display: flex;
		align-items: center;
		padding: 0 0.5em;
		margin-right: 0.5em;
		border-style: none;
	}
	button.action {
		background: none;
	}
	.listbox {
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
	.listbox > li {
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
	.error {
		color: var(--color-error);
	}
</style>
