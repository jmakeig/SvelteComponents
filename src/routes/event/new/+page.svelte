<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';
	import { applyAction, enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { type MaybeInvalid, is_invalid } from '$components/FormControl/validation';
	import type { Event } from '$lib/entities';
	import FormControl from '$components/FormControl/FormControl.svelte';
	import { validate_event } from '$lib/entities';

	const { /*data,*/ form }: PageProps = $props();

	function create_submit_enhance<Out>(
		validate: (data: unknown) => MaybeInvalid<Out>,
		unmarshal: (form_data: FormData) => unknown = (form_data) => Object.fromEntries(form_data)
	): SubmitFunction {
		return ({ formData, cancel }) => {
			const result = validate(unmarshal(formData));
			if (is_invalid(result)) {
				applyAction({
					type: 'failure',
					status: 422,
					data: result //{ validation: result.validation, input: result.input }
				});
				cancel();
			}
		};
	}
</script>

<h1>Event</h1>

<form
	method="post"
	action="?/new"
	novalidate
	class:invalid={form?.validation?.has()}
	use:enhance={create_submit_enhance<Event>((data: unknown) => validate_event(data, true))}
>
	<FormControl name="customer-workload" value={undefined} validation={form?.validation} />
	<FormControl name="outcome" value={form?.outcome} validation={form?.validation}>
		{#snippet input(provided)}
			<textarea {...provided}></textarea>
		{/snippet}
	</FormControl>
	<FormControl
		name="happened_at"
		value={form?.happened_at?.toISOString()}
		validation={form?.validation}
	/>
	<div class="control actions">
		<button class="default">Create</button>
	</div>
</form>
