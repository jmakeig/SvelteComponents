<script lang="ts">
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<nav><a href="/customers">Customers</a>, <a href="/customers/new">New</a></nav>
{@render children()}
