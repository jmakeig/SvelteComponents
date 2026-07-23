<script lang="ts">
	import EventForm from '../../EventForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<EventForm action="edit" {form} data={data.event} stages={data.stages} />
