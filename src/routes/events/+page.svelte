<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Events</h1>
<nav><a href="/events">Events</a>, <a href="/events/new">New</a></nav>
<ul>
	{#each data.events as event}
		<li><a href="/events/{event.event}">{event.outcome} ({event.happened_at.toISOString()})</a></li>
	{:else}<li>No events. <a href="/events/new">Create one.</a></li>
	{/each}
</ul>
