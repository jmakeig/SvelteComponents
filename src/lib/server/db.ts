import pg from 'pg';
import {
	POSTGRES_HOST,
	POSTGRES_PORT,
	POSTGRES_USER,
	POSTGRES_PASSWORD,
	POSTGRES_DB
} from '$env/static/private';

import { parse_date_local } from '$lib/entities';
export function create_connection() {
	const connection = new pg.Pool({
		host: POSTGRES_HOST || 'db',
		port: Number(POSTGRES_PORT || 5432),
		user: POSTGRES_USER,
		password: POSTGRES_PASSWORD,
		database: POSTGRES_DB,
		options: `-c search_path=${POSTGRES_DB}`
	});

	return {
		get connection() {
			return connection;
		},
		/**
		 * Close the connection pool.
		 */
		async close() {
			return await connection.end();
		},

		async readonly<T extends pg.QueryResultRow = Record<string, unknown>>(
			sql: string,
			params: Array<unknown> = []
		): Promise<pg.QueryResult<T>> {
			return this.transaction<pg.QueryResult<T>>((client) => client.query<T>(sql, params), true);
		},

		/**
		 * Wraps a callback in a database transaction. Thrown errors will rollaback.
		 */
		async transaction<T>(
			runner: (client: pg.PoolClient) => Promise<T>,
			readonly = false
		): Promise<T> {
			const client = await connection.connect();
			try {
				await client.query('BEGIN');
				if (readonly) {
					await client.query('SET TRANSACTION READ ONLY');
				}
				try {
					const res = await runner(client);
					await client.query('COMMIT');
					return res;
				} catch (/** @type {any} */ err) {
					await client.query('ROLLBACK');
					throw wrap_error(err);
				}
			} finally {
				client.release();
			}
		},
		/**
		 * Single-statement query that requires no cleanup.
		 */
		async query<T extends pg.QueryResultRow = Record<string, unknown>>(
			statement: string,
			params: Array<unknown> = []
		): Promise<pg.QueryResult<T>> {
			try {
				return await connection.query<T>(statement, params);
			} catch (err) {
				throw wrap_error(err);
			}
		}
	};
}

/** Signals a database constraint violation (foreign key, uniqueness, check), same role as the
 *  in-memory mock's `ConstraintError` it replaces. `db.ts` re-exports this. */
export class ConstraintError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ConstraintError';
	}
}

function wrap_error(err: unknown): unknown {
	if (err instanceof Error && 'code' in err) {
		// https://www.postgresql.org/docs/current/errcodes-appendix.html
		const CONSTRAINT_CODES = new Set([
			'23505', // unique_violation — dup label
			'23503', // foreign_key_violation — bad ref on insert/update, or RESTRICT-blocked delete
			'23514' // check_violation — events' XOR / null-implies-null checks
		]);
		const code = (err as Error & { code?: string }).code;
		if (code && CONSTRAINT_CODES.has(code)) {
			const detail = 'detail' in err ? (err as { detail?: string }).detail : undefined;
			return new ConstraintError(detail ?? err.message);
		}
	}
	return err;
}

/**
 * Postgres serializes `DATE` as a bare ISO string inside jsonb (e.g. `"2026-07-10"`).
 * `new Date(str)` would parse that as UTC midnight; `parse_date_local` (used everywhere else
 * in the app) constructs local midnight instead — reuse it here so a real DB round-trip can't
 * silently shift `happened_at` by a day in negative-UTC-offset zones.
 */
export function revive_happened_at<T extends { happened_at: unknown }>(row: T): T {
	return { ...row, happened_at: parse_date_local(row.happened_at as string) };
}
