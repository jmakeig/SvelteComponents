<script lang="ts">
	import type { PageProps } from './$types';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { Validated } from '$components/FormControl/validation';

	import { applyAction, enhance } from '$app/forms';

	import { get_colors } from '$lib/data.js';
	import ComboBox from '$components/ComboBox/ComboBox.svelte';
	import FormControl from '$components/FormControl/FormControl.svelte';

	import { match_entities } from '$lib/pipeline';

	let { data, form }: PageProps = $props();

	function create_submit_enhance<Out, In = unknown>(
		validate: (data: unknown) => Validated<Out, In>,
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

	type Ref = string;

	type Event = {
		outcome: string;
		happened_at: Date;
	} & ({ customer: Ref; workload?: never } | { customer?: never; workload?: Ref });

	type PendingEvent = {
		customer_workload?: string | null;
		outcome?: string | null;
		happened_at?: Date | string | null;
	};

	function validate_event(event: unknown): Validated<Event, PendingEvent> {
		throw new Error();
	}

	function unmarshal_event(form_data: FormData): PendingEvent {
		return Object.fromEntries(form_data);
	}
</script>

<form
	method="post"
	action="?/create"
	class:invalid={form?.validation?.has()}
	novalidate
	use:enhance={create_submit_enhance(validate_event, unmarshal_event)}
>
	<FormControl
		name="description"
		value={'form?.exercise.description'}
		label="Description"
		validation={form?.validation}
		help="A short summary"
	>
		{#snippet input(provided)}
			<textarea {...provided}></textarea>
		{/snippet}
	</FormControl>
	<FormControl
		name="customer-workload2"
		value={'form?.customer_workload'}
		label="Stuff"
		validation={form?.validation}
		help="The customer or workload"
	>
		{#snippet input({ name })}
			<ComboBox {name} label="Customer or workload" search={match_entities} debug="false">
				{#snippet item(match, mode)}
					<div class="item">
						{#if 'ref' in match && 'compact' !== mode}
							<div class="ref">
								{@render icon_customer()}
								{match.ref.name}
							</div>
						{/if}
						<div>
							{#if 'company' === match.type}
								{@render icon_customer()}
							{:else if 'workload' === match.type}
								{@render icon_workload()}
							{/if}
							{match.name}
						</div>
						{#if 'compact' !== mode}
							<div class="meta">
								Last updated by <span class="user">Alice</span> <span class="duration">2 days</span> ago
							</div>
						{/if}
					</div>
				{/snippet}
			</ComboBox>
		{/snippet}
	</FormControl>

	<!-- <div class="control">
		<label for="customer-workload">Customer/Workload</label>
		<div class="contents">
			<ComboBox
				name="customer-workload"
				label="Customer or workload"
				search={match_entities}
				debug="false"
			>
				{#snippet item(match, mode)}
					<div class="item">
						{#if 'ref' in match && 'compact' !== mode}
							<div class="ref">
								{@render icon_customer()}
								{match.ref.name}
							</div>
						{/if}
						<div>
							{#if 'company' === match.type}
								{@render icon_customer()}
							{:else if 'workload' === match.type}
								{@render icon_workload()}
							{/if}
							{match.name}
						</div>
						{#if 'compact' !== mode}
							<div class="meta">
								Last updated by <span class="user">Alice</span> <span class="duration">2 days</span> ago
							</div>
						{/if}
					</div>
				{/snippet}
			</ComboBox>
		</div>
	</div> -->

	<div class="control">
		<label for="color1">Color</label>
		<div class="contents">
			<ComboBox
				name="color1"
				label="Color"
				search={get_colors}
				value={data.color1}
				onselect={(evt) => console.log(evt)}
			>
				{#snippet item(match)}
					<strong>{match.name}</strong> — {match.value}
				{/snippet}
			</ComboBox>
		</div>
	</div>

	<div class="control">
		<label for="color2">Disabled</label>
		<div class="contents">
			<ComboBox name="color2" label="Color" search={get_colors} value={data.color2} disabled>
				{#snippet item(match)}
					<strong>{match.name}</strong> — {match.value}
				{/snippet}
			</ComboBox>
		</div>
	</div>
	<div class="control">
		<label for="color3">Read-only</label>
		<div class="contents">
			<ComboBox name="color3" label="Color" search={get_colors} value={data.color3} readonly>
				{#snippet item(match)}
					<strong>{match.name}</strong> — {match.value}
				{/snippet}
			</ComboBox>
		</div>
	</div>
	<div class="control">
		<label for="vanilla">Vanilla</label>
		<div class="contents"><input id="vanilla" /></div>
	</div>
</form>

{#snippet icon_customer(width = '1em', height = '1em')}
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
		class="icon icon-tabler icons-tabler-outline icon-tabler-building-store"
		><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 21l18 0" /><path
			d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2 -4h14l2 4"
		/><path d="M5 21l0 -10.15" /><path d="M19 21l0 -10.15" /><path
			d="M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4"
		/></svg
	>
{/snippet}

{#snippet icon_workload(width = '1em', height = '1em')}
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
		class="icon icon-tabler icons-tabler-outline icon-tabler-truck-loading"
		><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
			d="M2 3h1a2 2 0 0 1 2 2v10a2 2 0 0 0 2 2h15"
		/><path d="M9 9a3 3 0 0 1 3 -3h4a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-4a3 3 0 0 1 -3 -3l0 -2" /><path
			d="M7 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"
		/><path d="M16 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /></svg
	>
{/snippet}

<style>
	form {
		width: 85%;
	}
	.item .icon {
		vertical-align: middle;
	}
	.item .ref {
		margin-bottom: 0.25em;
		color: hsl(from currentColor h s 50%);
	}
	.item .ref,
	.item .meta {
		font-size: 0.85em;
	}
	.meta {
		margin-top: 0.25em;
		color: hsl(from currentColor h s 50%);
	}
</style>
