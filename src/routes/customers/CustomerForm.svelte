<script lang="ts">
	import { enhance } from '$app/forms';
	import FormControl from '$components/FormControl/FormControl.svelte';
	import { create_submit_enhance } from '$components/FormControl/FormControl.svelte';
	import type { Validated } from '$components/FormControl/validation';

	import { type Customer, type Segment, validate_customer } from '$lib/entities';

	interface Props {
		action?: 'new' | 'edit' | 'view';
		data: Customer;
		form?: Validated<Customer> | null; // ActionData
		segments: Segment[];
	}

	const { action = 'edit', data, form, segments }: Props = $props();
	/** Either a validated `Customer` or the raw (possibly invalid) submission being redisplayed — read fields off it with a local cast, not a modeled shape. */
	const customer = $derived((form?.data ?? data) as Record<string, unknown> | undefined);
</script>

<form
	method="post"
	action="?/{action}"
	novalidate
	class:invalid={form?.validation?.has()}
	use:enhance={create_submit_enhance<Customer>((value: unknown) => validate_customer(value, true))}
>
	{#if form}
		{#if form.validation}
			<p class="error">Nope! {form.validation.first()?.message}</p>
		{:else}
			<p>Sucessfully submitted ({customer!.customer})</p>
		{/if}
	{/if}
	<input type="hidden" name="customer" value={customer?.customer} />
	<FormControl name="name" value={customer?.name} validation={form?.validation}>
		{#snippet input(provided)}
			<input type="text" {...provided} />
		{/snippet}
	</FormControl>
	<FormControl name="segment" value={customer?.segment ?? ''} validation={form?.validation}>
		{#snippet input(provided)}
			<select {...provided}>
				<option value="">—</option>
				{#each segments as segment}
					<option value={segment.value}>{segment.name}</option>
				{/each}
			</select>
		{/snippet}
	</FormControl>
	<div class="control actions">
		<button class="default">
			{#if 'new' === action}
				{@render icon_create()} Create
			{:else if 'edit' === action}
				{@render icon_create()} Update
			{/if}
		</button>
		{#if 'edit' === action}
			<button
				type="submit"
				form="customer-delete"
				onclick={(evt) => {
					if (!confirm('Delete this customer?')) evt.preventDefault();
				}}
			>
				Delete
			</button>
		{/if}
	</div>
</form>

{#if 'edit' === action}
	<form id="customer-delete" method="post" action="?/delete" use:enhance></form>
{/if}

{#snippet icon_create(width = '1em', height = '1em')}
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
		class="icon icon-tabler icons-tabler-outline icon-tabler-clipboard-plus"
		><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
			d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"
		/><path d="M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2" /><path
			d="M10 14h4"
		/><path d="M12 12v4" /></svg
	>
{/snippet}
