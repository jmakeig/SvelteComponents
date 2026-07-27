<script lang="ts" module>
	export class DateTimeLocal {
		#datetime: string;
		#offset: string;
		constructor(datetime: string, offset: string) {
			this.#datetime = $state(datetime);
			this.#offset = $state(offset);
		}
		get datetime(): string {
			return this.#datetime;
		}
		set datetime(value: string) {
			this.#datetime = value;
		}
		get offset(): string {
			return this.#offset;
		}
		set offset(value: string) {
			this.#offset = value;
		}
		get iso(): string {
			return this.#datetime.slice(0, 16) + this.#offset;
		}
		set iso(value: string) {
			this.#datetime = value.slice(0, 16);
			this.#offset = value.slice(16);
		}
		trunc(time: string = '00:00') {
			this.#datetime = this.#datetime.slice(0, 11) + time;
		}
		/** Formats an arbitrary `Date` as a `datetime-local`-shaped string in whatever timezone
		 *  the current runtime's local getters report (the server's during SSR, the browser's
		 *  after hydration) — same convention `now()` uses for "now". */
		static from(date: Date): string {
			function pad(n: number): string {
				return String(n).padStart(2, '0');
			}
			return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
		}
		static now(): string {
			return DateTimeLocal.from(new Date());
		}
		static offset_local() {
			const offset_minutes = new Date().getTimezoneOffset();
			// Reverse the sign: JavaScript returns positive for behind UTC and negative for ahead
			const sign = offset_minutes <= 0 ? '+' : '-';
			const abs = Math.abs(offset_minutes);
			const hours = String(Math.floor(abs / 60)).padStart(2, '0');
			const minutes = String(abs % 60).padStart(2, '0');
			return `${sign}${hours}:${minutes}`;
		}
	}
</script>

<script lang="ts">
	interface Props {
		name: string;
		id?: string;
		value?: string;
		offset?: string;
		iso?: string;
	}
	let {
		name,
		id,
		value = $bindable(DateTimeLocal.now()),
		offset = $bindable(DateTimeLocal.offset_local()),
		iso = $bindable()
	}: Props = $props();
	// Seeding from `iso` (not just `value`/`offset`) matters when a caller passes an initial
	// `iso` (e.g. an existing Event's `happened_at`): without it, `datetime` starts from the
	// `value`/`offset` defaults ("now"), and the mount-time "propagate to parent" effect below
	// fires before the "update from parent" effect gets a chance to react — permanently
	// clobbering the caller's seed with "now" before it's ever applied.
	let datetime = new DateTimeLocal(iso ? iso.slice(0, 16) : value, iso ? iso.slice(16) : offset);

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
	<input type="hidden" {name} value={iso} />
	<!-- <button
		type="button"
		onclick={(evt) => {
			datetime.trunc();
		}}>Trunc</button
	> -->
</div>
