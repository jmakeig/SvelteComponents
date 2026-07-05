<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { type Event, type PendingEvent, validate_event } from '$lib/entities';
	import FormControl from '$components/FormControl/FormControl.svelte';
	import { create_submit_enhance } from '$components/FormControl/FormControl.svelte';

	const { /*data,*/ form }: PageProps = $props();
</script>

<h1>Event</h1>

<form
	method="post"
	action="?/new"
	novalidate
	class:invalid={form?.validation.has()}
	use:enhance={create_submit_enhance<Event, PendingEvent>((data: unknown) =>
		validate_event(data as PendingEvent, true)
	)}
>
	<FormControl name="customer-workload" value={undefined} validation={form?.validation} />
	<FormControl name="outcome" value={form?.data?.outcome} validation={form?.validation}>
		{#snippet input(provided)}
			<textarea {...provided}></textarea>
		{/snippet}
	</FormControl>
	<FormControl
		name="happened_at"
		value={form?.data?.happened_at instanceof Date
			? form.data.happened_at.toISOString()
			: form?.data?.happened_at}
		validation={form?.validation}
	/>
	<div class="control actions">
		<button class="default">Create</button>
	</div>
</form>
