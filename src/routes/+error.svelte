<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/state';

	const INTERNAL = /node_modules|node:internal/;
</script>

<h1>{page.error?.original?.name}: {page.error?.message} ({page.status})</h1>
{#if dev}
	<ol class="stack">
		{#each page.error?.original?.stack as stack, i}
			{#if i > 0}
				<li class:internal={INTERNAL.test(stack)}>{stack}</li>
			{/if}
		{/each}
	</ol>
{/if}

<style>
	.stack li {
		margin: 0.5em 0;
	}
	.stack li.internal {
		color: color-mix(in srgb, currentColor 25%, Canvas);
	}
</style>
