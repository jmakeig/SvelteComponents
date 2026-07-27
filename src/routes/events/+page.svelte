<script lang="ts">
	import type { PageProps } from './$types';
	import { format_local } from '$lib/datetime';

	let { data }: PageProps = $props();
</script>

<h1>Events</h1>
<p>{data.events.length}</p>
<ul>
	{#each data.events as event}
		<li>
			<a href="/events/{event.event}"
				>{event.outcome} ({format_local(event.happened_at, data.timezone, data.locale)})</a
			>
			<pre>{JSON.stringify(event, null, 2)}</pre>
		</li>
	{:else}<li>No events. <a href="/events/new">Create one.</a></li>
	{/each}
</ul>
