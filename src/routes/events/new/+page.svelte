<script lang="ts">
	import type { PageProps } from './$types';
	import EventForm from '../EventForm.svelte';

	const { data, form }: PageProps = $props();
</script>

<h1>Event</h1>
<EventForm action="new" {form} {data} />
