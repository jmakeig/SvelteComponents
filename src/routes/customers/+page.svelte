<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Customers</h1>
<p>{data.customers.length}</p>
<ul>
	{#each data.customers as customer}
		<li>
			<a href="/customers/{customer.label}">{customer.name} ({customer.label})</a>
			<pre>{JSON.stringify(customer, null, 2)}</pre>
		</li>
	{:else}<li>No customers. <a href="/customers/new">Create one.</a></li>
	{/each}
</ul>
