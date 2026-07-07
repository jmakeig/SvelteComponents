<script lang="ts" module>
	import type { SubmitFunction } from '@sveltejs/kit';
	import { applyAction } from '$app/forms';
	import { type Validated } from './validation';

	/**
	 * Creates a handler for `use:enhance`.
	 * @usage ```
	 *	use:enhance={create_submit_enhance<ENTITY>(validate_ENTITY)}
	 * ```
	 */
	export function create_submit_enhance<Out>(
		validate: (data: unknown) => Validated<Out>,
		unmarshal: (form_data: FormData) => unknown = (form_data) => Object.fromEntries(form_data)
	): SubmitFunction {
		return ({ formData, cancel }) => {
			const result = validate(unmarshal(formData));
			if (result.validation) {
				applyAction({
					type: 'failure',
					status: 422,
					data: result
				});
				cancel();
			}
		};
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { type Attachment, createAttachmentKey } from 'svelte/attachments';
	import { Validation } from './validation.js';

	interface ProvidedAttrs {
		name: string;
		label?: string;
		[key: string]: unknown;
	}
	interface Props {
		name: string;
		id?: string;
		label?: string;
		validation?: Validation<unknown>;
		value?: unknown;
		help?: string;
		input?: Snippet<[ProvidedAttrs]>;
		[key: string]: unknown;
	}

	/**
	 * Used for the default tranlation from a name to a label.
	 */
	function title_case(str: string): string {
		return str
			.toLowerCase()
			.split(/[\s_]/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	let {
		name,
		// svelte-ignore state_referenced_locally
		id = name,
		// svelte-ignore state_referenced_locally
		label = title_case(name),
		validation = new Validation(),
		value = $bindable(),
		help,
		input,
		/** Any other properties passed in */
		...other
	}: Props = $props();

	export const attrs: Record<string, string> = {
		placeholder: '\u200B',
		autocomplete: 'off',
		autocapitalize: 'off',
		spellcheck: 'false'
	};

	function validate(
		v: Validation<unknown>
	): Attachment<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
		return function _validate(element) {
			$effect(() => {
				const { name } = element;
				const message = v?.first(name)?.message ?? '';
				element.setCustomValidity(message);
			});
			return () => {
				element.setCustomValidity('');
			};
		};
	}
</script>

<div class="control">
	<label for={name}>{label}</label>
	<div class="contents">
		{#if input}
			{@render input({
				name,
				id,
				label,
				value,
				[createAttachmentKey()]: validate(validation),
				placeholder: attrs.placeholder,
				'aria-invalid': validation?.has(name),
				'aria-errormessage': validation?.has(name) ? `${name}-error` : undefined,
				'aria-describedby': `${name}-help`,
				...other
			})}
		{:else}
			<input
				type="text"
				{id}
				{name}
				bind:value
				{@attach validate(validation)}
				aria-invalid={validation?.has(name)}
				aria-errormessage={validation?.has(name) ? `${name}-error` : undefined}
				aria-describedby="{name}-help"
				{...attrs}
				{...other}
			/>
		{/if}
		{#if help}<p class="helper" id={`${name}-help`}>{help}</p>{/if}
		{#if validation?.has(name)}
			<p class="validation" id={`${name}-error`} aria-live="assertive">
				{validation.first(name)?.message}
			</p>
		{/if}
	</div>
</div>
