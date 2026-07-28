<script lang="ts">
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<nav>
	<a href="/customers">Customers</a> <a href="/workloads">Workloads</a> <a href="/events">Events</a>
</nav>
{@render children()}

<footer>
	<code>{data.locale}</code>, <code>{data.timezone}</code>
</footer>
<style>
	nav, footer {
		margin: 1em 0;
	}
</style>
