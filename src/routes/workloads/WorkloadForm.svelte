<script lang="ts">
	import { enhance } from '$app/forms';
	import CustomerCombo from '$lib/components/CustomerCombo.svelte';
	import FormControl from '$components/FormControl/FormControl.svelte';
	import { create_submit_enhance } from '$components/FormControl/FormControl.svelte';
	import type { Validated } from '$components/FormControl/validation';

	import { type Stage, type Workload, validate_workload } from '$lib/entities';
	import type { Match } from '$components/ComboBox/machine';

	interface Props {
		action?: 'new' | 'edit' | 'view';
		data: Workload;
		form?: Validated<Workload> | null; // ActionData
		stages: Stage[];
	}

	const { action = 'edit', data, form, stages }: Props = $props();
	/** Either a validated `Workload` or the raw (possibly invalid) submission being redisplayed — read fields off it with a local cast, not a modeled shape. */
	const workload = $derived((form?.data ?? data) as Record<string, unknown> | undefined);

	function initial_customer_match(workload: Workload): Match | undefined {
		if (!workload.customer) return undefined;
		const { customer: id, name, label } = workload.customer;
		return { name, label, value: id };
	}
</script>

<form
	method="post"
	action="?/{action}"
	novalidate
	class:invalid={form?.validation?.has()}
	use:enhance={create_submit_enhance<Workload>((value: unknown) => validate_workload(value, true))}
>
	{#if form}
		{#if form.validation}
			<p class="error">Nope! {form.validation.first()?.message}</p>
		{:else}
			<p>Sucessfully submitted ({workload!.workload})</p>
		{/if}
	{/if}
	<input type="hidden" name="workload" value={workload?.workload} />
	<FormControl name="name" value={workload?.name} validation={form?.validation}>
		{#snippet input(provided)}
			<input type="text" {...provided} />
		{/snippet}
	</FormControl>
	<FormControl name="customer" label="Customer" value={undefined} validation={form?.validation}>
		{#snippet input({ name, label = '' })}
			<CustomerCombo {name} {label} value={initial_customer_match(data)} />
		{/snippet}
	</FormControl>
	{#if 'new' === action}
		<!-- Size/stage only accept an initial value here — once a Workload exists, they're
		     derived from its Event history (see `validate_workload`/`api.create_workload`) and
		     can only change by adding a WorkloadEvent, not by editing the Workload directly. -->
		<FormControl name="size" value={workload?.size ?? ''} validation={form?.validation}>
			{#snippet input(provided)}
				<input type="number" min="0" step="10000" {...provided} />
			{/snippet}
		</FormControl>
		<FormControl
			name="stage"
			value={(workload?.stage as Stage | null)?.value ?? ''}
			validation={form?.validation}
		>
			{#snippet input(provided)}
				<select {...provided}>
					<option value="">—</option>
					{#each stages as stage}
						<option value={stage.value}>{stage.name}</option>
					{/each}
				</select>
			{/snippet}
		</FormControl>
	{/if}
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
				form="workload-delete"
				onclick={(evt) => {
					if (!confirm('Delete this workload?')) evt.preventDefault();
				}}
			>
				Delete
			</button>
		{/if}
	</div>
</form>

{#if 'edit' === action}
	<form id="workload-delete" method="post" action="?/delete" use:enhance></form>
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
