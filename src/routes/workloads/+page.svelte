<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Workloads</h1>
<p>{data.workloads.length}</p>
<ul>
	{#each data.workloads as workload}
		<li>
			<a href="/workloads/{workload.workload}">{workload.name} ({workload.customer.name})</a>
			<pre>{JSON.stringify(workload, null, 2)}</pre>
		</li>
	{:else}<li>No workloads. <a href="/workloads/new">Create one.</a></li>
	{/each}
</ul>
