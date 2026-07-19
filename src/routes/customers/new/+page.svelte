<script lang="ts">
	import type { PageProps } from './$types';
	import CustomerForm from '../CustomerForm.svelte';

	const { data, form }: PageProps = $props();
</script>

<h1>Customer</h1>
<CustomerForm action="new" {form} {data} />
