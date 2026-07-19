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
