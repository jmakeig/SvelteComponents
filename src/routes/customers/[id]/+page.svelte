<script lang="ts">
	import CustomerForm from '../CustomerForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<CustomerForm action="edit" {form} data={data.customer} />
