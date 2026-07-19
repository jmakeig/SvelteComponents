<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>{data.event.outcome}</h1>
<p><a href="/events/{data.event.event}/edit">Edit</a></p>
<pre>{JSON.stringify(data.event, null, 2)}</pre>
