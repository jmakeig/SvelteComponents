<script lang="ts">
	import type { PageProps } from './$types';
	import FormControl from '$components/FormControl/FormControl.svelte';

	const { data, form }: PageProps = $props();
</script>

<h1>Event</h1>

<form method="post" action="?/new">
	<FormControl
		name="customer-workload"
		value={data.customer?.customer}
		validation={form?.validation}
	></FormControl>
	<FormControl name="outcome" value={data.outcome} validation={form?.validation}>
		{#snippet input({ name, value })}
			<textarea {name}>{value}</textarea>
		{/snippet}
	</FormControl>
	<FormControl
		name="happened_at"
		value={data?.happened_at?.toISOString()}
		validation={form?.validation}
	/>
	<div class="control actions">
		<button class="default">Create</button>
	</div>
</form>
