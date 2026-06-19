<script>
	import { get_colors } from '$lib/data.js';
	import ComboBox from '$lib/ComboBox.svelte';
</script>

<label for="color">Color</label>
<ComboBox name="color" search={get_colors} debug>
	{#snippet item(match)}
		<strong>{match.label}</strong> — {match.value}
	{/snippet}
</ComboBox>
