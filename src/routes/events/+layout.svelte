<script lang="ts">
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<nav><a href="/events">Events</a>, <a href="/events/new">New</a></nav>
{@render children()}
