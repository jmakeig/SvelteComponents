<script lang="ts">
	import ComboBox from '$components/ComboBox/ComboBox.svelte';
	import type { Match } from '$components/ComboBox/machine';

	interface Props {
		name: string;
		label: string;
		value?: Match;
	}

	const { name, label, value }: Props = $props();

	async function search(query: string): Promise<Match[]> {
		const response = await fetch(`/api/customer-workload?q=${encodeURIComponent(query)}`);
		if (!response.ok) throw new Error('customer_workload_search_failed');
		return response.json();
	}
</script>

<ComboBox {name} {label} {value} {search} />
