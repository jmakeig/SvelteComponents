<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Events</h1>
<p>{data.events.length}</p>
<ul>
	{#each data.events as event}
		<li>
			<a href="/events/{event.event}">{event.outcome} ({event.happened_at.toISOString()})</a>
			<pre>{JSON.stringify(event, null, 2)}</pre>
		</li>
	{:else}<li>No events. <a href="/events/new">Create one.</a></li>
	{/each}
</ul>
