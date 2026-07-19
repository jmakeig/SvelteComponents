<script lang="ts">
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>
<nav>
	<a href="/customers">Customers</a> <a href="/workloads">Workloads</a> <a href="/events">Events</a>
</nav>
{@render children()}

<style>
	nav {
		margin: 1em 0;
	}
</style>
