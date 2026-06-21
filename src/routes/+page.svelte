<script lang="ts">
	// import { get_colors } from '$lib/data.js';
	import ComboBox from '$lib/ComboBox.svelte';

	import { match_entities } from '$lib/pipeline';
</script>

<label for="color">Color</label>

<div class="control">
	<ComboBox name="customer-workload" search={match_entities} debug>
		{#snippet item(match)}
			{match.name}<br/>
			{#if 'ref' in match}
				Customer: {match.ref.name}
			{/if}
		{/snippet}
	</ComboBox>
</div>

<!-- <div class="control">
	<ComboBox name="color" search={get_colors} debug>
		{#snippet item(match)}
			<strong>{match.label}</strong> — {match.value}
		{/snippet}
	</ComboBox>
</div> -->

<style>
	.control {
		margin: 2em 0;
	}
</style>
