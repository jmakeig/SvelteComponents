<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>{data.customer.name}</h1>
<p><a href="/customers/{data.customer.label}/edit">Edit</a></p>
<pre>{JSON.stringify(data.customer, null, 2)}</pre>
