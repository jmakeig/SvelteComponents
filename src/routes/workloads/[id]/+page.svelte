<script lang="ts">
	import WorkloadForm from '../WorkloadForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<WorkloadForm action="edit" {form} data={data.workload} stages={data.stages} />
