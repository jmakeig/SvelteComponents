<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { type Event, type PendingEvent, validate_event } from '$lib/entities';
	import FormControl from '$components/FormControl/FormControl.svelte';
	import { create_submit_enhance } from '$components/FormControl/FormControl.svelte';

	const { data, form }: PageProps = $props();

	type Loosey<T> = T | string | null | undefined;

	function to_iso_date(value: Loosey<Date>): Loosey<string> {
		if (value instanceof Date) return value.toISOString().slice(0, 10);
		return value;
	}

	/** Instantiates an in-progress entity from the form submission or falling back to the loaded `data`.*/
	let event: PendingEvent = $derived(form?.data ?? data);
</script>

<h1>Event</h1>

<form
	method="post"
	action="?/new"
	novalidate
	class:invalid={form?.validation.has()}
	use:enhance={create_submit_enhance<Event, PendingEvent>((value: unknown) =>
		validate_event(value as PendingEvent, true)
	)}
>
	<FormControl name="customer-workload" value={undefined} validation={form?.validation} />
	<FormControl name="outcome" value={event.outcome} validation={form?.validation}>
		{#snippet input(provided)}
			<textarea {...provided}></textarea>
		{/snippet}
	</FormControl>
	<FormControl
		name="happened_at"
		value={to_iso_date(event.happened_at)}
		validation={form?.validation}
	>
		{#snippet input(provided)}
			<input type="date" {...provided} />
		{/snippet}
	</FormControl>
	<div class="control actions">
		<button class="default">Create</button>
	</div>
</form>
