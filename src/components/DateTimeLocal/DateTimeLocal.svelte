<script lang="ts" module>
	export class DateTimeLocal {
		#datetime: string;
		#timezone: string;
		constructor(datetime: string, timezone: string) {
			this.#datetime = $state(datetime);
			this.#timezone = timezone;
		}
		get datetime(): string {
			return this.#datetime;
		}
		set datetime(value: string) {
			this.#datetime = value;
		}
		/** Derived, not stored: recomputed from whatever `datetime` currently holds, so it stays
		 *  correct across DST as the user picks different dates rather than freezing at mount.
		 *  Approximates the wall-clock instant by treating `datetime` as UTC — exact except within
		 *  the DST transition hour itself, an ambiguity inherent to any datetime-local picker. */
		get offset(): string {
			return DateTimeLocal.offset_for(new Date(this.#datetime + ':00Z'), this.#timezone);
		}
		get iso(): string {
			return this.#datetime + this.offset;
		}
		set iso(value: string) {
			this.#datetime = value.slice(0, 16);
		}
		trunc(time: string = '00:00') {
			this.#datetime = this.#datetime.slice(0, 11) + time;
		}
		/** Formats an arbitrary `Date` as a `datetime-local`-shaped string in `timezone`, so SSR
		 *  and post-hydration renders agree regardless of the server's or browser's own OS zone. */
		static from(date: Date, timezone: string): string {
			const parts = new Intl.DateTimeFormat('en-US', {
				timeZone: timezone,
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
				hourCycle: 'h23'
			}).formatToParts(date);
			const get = (type: string) => parts.find((part) => type === part.type)!.value;
			return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
		}
		static now(timezone: string): string {
			return DateTimeLocal.from(new Date(), timezone);
		}
		/** The UTC offset in effect for `date` specifically *in `timezone`* — not "today's"
		 *  offset — so a historical date on the other side of a DST transition is still correct. */
		static offset_for(date: Date, timezone: string): string {
			const parts = new Intl.DateTimeFormat('en-US', {
				timeZone: timezone,
				timeZoneName: 'longOffset'
			}).formatToParts(date);
			const name = parts.find((part) => 'timeZoneName' === part.type)?.value ?? 'GMT';
			return 'GMT' === name ? '+00:00' : name.slice(3);
		}
	}
</script>

<script lang="ts">
	interface Props {
		name: string;
		id?: string;
		timezone?: string;
		value?: string;
		iso?: string;
	}
	let {
		name,
		id,
		timezone = 'UTC',
		value = $bindable(),
		iso = $bindable()
	}: Props = $props();
	// Seeding from `iso` (not just `value`) matters when a caller passes an initial `iso` (e.g.
	// an existing Event's `happened_at`): without it, `datetime` starts from the "now" default
	// below, and the mount-time "propagate to parent" effect below fires before the "update
	// from parent" effect gets a chance to react — permanently clobbering the caller's seed with
	// "now" before it's ever applied.
	// svelte-ignore state_referenced_locally
	let datetime = new DateTimeLocal(iso ? iso.slice(0, 16) : (value ?? DateTimeLocal.now(timezone)), timezone);

	// Propogate _to_ the parent
	$effect.pre(() => {
		iso = datetime.iso;
	});

	// Update _from_ the parent
	$effect(() => {
		if (iso !== datetime.iso && iso) {
			datetime.iso = iso;
		}
	});

	//'2025-02-01T13:14-06:30'
</script>

<div style="display: contents">
	<!-- <p>{name}</p> -->
	<input type="datetime-local" {id} bind:value={datetime.datetime} />
	<!-- Reads `datetime.iso` directly, not the bindable `iso` prop: `$effect.pre` below (which
	     keeps `iso` in sync) doesn't run during SSR, so the hidden input would submit without an
	     offset on a fresh server render if it depended on that propagation instead. -->
	<input type="hidden" {name} value={datetime.iso} />
	<!-- <button
		type="button"
		onclick={(evt) => {
			datetime.trunc();
		}}>Trunc</button
	> -->
</div>
