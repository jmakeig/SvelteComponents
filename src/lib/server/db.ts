import { parse_date_local } from '$lib/entities';
import { query, ConstraintError } from './connection';

export { query, ConstraintError };

/**
 * Postgres serializes `DATE` as a bare ISO string inside jsonb (e.g. `"2026-07-10"`).
 * `new Date(str)` would parse that as UTC midnight; `parse_date_local` (used everywhere else
 * in the app) constructs local midnight instead — reuse it here so a real DB round-trip can't
 * silently shift `happened_at` by a day in negative-UTC-offset zones.
 */
export function revive_happened_at<T extends { happened_at: unknown }>(row: T): T {
	return { ...row, happened_at: parse_date_local(row.happened_at as string) };
}
