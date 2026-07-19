<script lang="ts">
	import ComboBox from '$components/ComboBox/ComboBox.svelte';
	import type { Match } from '$components/ComboBox/machine';

	interface CustomerWorkloadMatch extends Match {
		/** For a `'workload_*'` match, the customer it belongs to. */
		ref?: Match;
	}

	interface Props {
		name: string;
		label: string;
		value?: CustomerWorkloadMatch;
	}

	const { name, label, value }: Props = $props();

	async function search(query: string): Promise<CustomerWorkloadMatch[]> {
		const response = await fetch(`/api/customer-workload?q=${encodeURIComponent(query)}`);
		if (!response.ok) throw new Error('customer_workload_search_failed');
		return response.json();
	}
</script>

<ComboBox {name} {label} {value} {search}>
	{#snippet item(match, mode)}
		<div class="item">
			{#if match.ref && 'compact' !== mode}
				<div class="ref">
					{@render icon_customer()}
					{match.ref.name}
				</div>
			{/if}
			<div>
				{#if match.value.startsWith('customer_')}
					{@render icon_customer()}
				{:else if match.value.startsWith('workload_')}
					{@render icon_workload()}
				{/if}
				{match.name}
			</div>
		</div>
	{/snippet}
</ComboBox>

{#snippet icon_customer(width = '1em', height = '1em', title: string = 'Customer')}
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
		><title>{title}</title><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
			d="M3 21l18 0"
		/><path
			d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2 -4h14l2 4"
		/><path d="M5 21l0 -10.15" /><path d="M19 21l0 -10.15" /><path
			d="M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4"
		/></svg
	>
{/snippet}

{#snippet icon_workload(width = '1em', height = '1em', title: string = 'Workload')}
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
		><title>{title}</title>
		<path stroke="none" d="M0 0h24v24H0z" fill="none" /><path
			d="M2 3h1a2 2 0 0 1 2 2v10a2 2 0 0 0 2 2h15"
		/><path d="M9 9a3 3 0 0 1 3 -3h4a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-4a3 3 0 0 1 -3 -3l0 -2" /><path
			d="M7 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"
		/><path d="M16 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /></svg
	>
{/snippet}

<style>
	.item .icon {
		vertical-align: middle;
	}
	.item .ref {
		margin-bottom: 0.25em;
		font-size: 0.85em;
		color: hsl(from currentColor h s 50%);
	}
</style>
