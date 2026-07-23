<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>{data.workload.name}</h1>
<p>
	<a href="/workloads/{data.workload.label}/edit">Edit</a>
	<a href="/events/new?workload={data.workload.workload}">Create Event</a>
</p>
<pre>{JSON.stringify(data.workload, null, 2)}</pre>

<h2>History</h2>
<ul>
	{#each data.history as entry}
		<li>
			<a href="/events/{entry.event}">{entry.happened_at.toISOString()}</a>
			{#if 'size' in entry}<span>size: {entry.size ?? '—'}</span>{/if}
			{#if 'stage' in entry}<span>stage: {entry.stage?.name ?? '—'}</span>{/if}
		</li>
	{:else}<li>No history yet.</li>
	{/each}
</ul>
