<script lang="ts">
	import FormControl from '$components/FormControl/FormControl.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Event</h1>

<form>
	<FormControl name="customer-workload"></FormControl>
	<FormControl name="outcome">
		{#snippet input({ name })}
			<textarea {name}></textarea>
		{/snippet}
	</FormControl>
	<FormControl
		name="happened_at"
		value={'data?.happened_at ?? new Date().toISOString().slice(0, 10)'}
	></FormControl>
</form>
