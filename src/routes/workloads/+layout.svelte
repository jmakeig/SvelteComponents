<script lang="ts">
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<nav><a href="/workloads">Workloads</a>, <a href="/workloads/new">New</a></nav>
{@render children()}
