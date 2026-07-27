/**
 * Parses a full ISO 8601 timestamp that carries an explicit UTC offset (e.g.
 * `2025-02-01T13:14-06:00`, as produced by `DateTimeLocal`'s `iso` on submit, or
 * `2025-02-01T19:14:00+00:00`, as `TIMESTAMPTZ` serializes inside `jsonb` on read) into a `Date`.
 * Unlike a bare date, an explicit offset means `new Date` already resolves this unambiguously —
 * no separate local-vs-UTC reconstruction needed.
 *
 * @param iso_timestamp
 * @returns `Date` or `new Date(NaN)` for invalid input
 */
export function parse_timestamp(iso_timestamp: string | null): Date {
	if (null === iso_timestamp) return new Date(NaN);
	return new Date(iso_timestamp);
}

/** Formats a `Date` for read-only human display in `timezone`, preferring `locale` (see
 *  `parse_accept_language`). Unlike `DateTimeLocal.from`/`offset_for`, this is pure display —
 *  never parsed back — so there's no reason to pin it to a fixed locale the way those are. */
export function format_local(date: Date, timezone: string, locale: string[]): string {
	return new Intl.DateTimeFormat(locale, {
		timeZone: timezone,
		dateStyle: 'medium',
		timeStyle: 'short'
	}).format(date);
}

/** Whether `timezone` is a real IANA zone name — `Intl.DateTimeFormat` throws for anything else. */
export function is_valid_timezone(timezone: string): boolean {
	try {
		Intl.DateTimeFormat(undefined, { timeZone: timezone });
		return true;
	} catch {
		return false;
	}
}

/** Parses an `Accept-Language` header into locale tags ordered by descending preference (`q`),
 *  for `Intl.DateTimeFormat`'s own locale negotiation to pick from. An empty/missing header
 *  yields `[]`, which `Intl.DateTimeFormat` treats the same as passing no locale at all. */
export function parse_accept_language(header: string | null): string[] {
	if (!header) return [];
	return header
		.split(',')
		.map((part) => {
			const [tag, q] = part.trim().split(';q=');
			return { tag, q: q ? parseFloat(q) : 1 };
		})
		.sort((a, b) => b.q - a.q)
		.map(({ tag }) => tag);
}
