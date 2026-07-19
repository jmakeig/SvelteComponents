<script lang="ts">
	import type { PageProps } from './$types';
	import WorkloadForm from '../WorkloadForm.svelte';

	const { data, form }: PageProps = $props();
</script>

<h1>Workload</h1>
<WorkloadForm action="new" {form} {data} stages={data.stages} />
