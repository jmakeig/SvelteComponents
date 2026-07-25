import pg from 'pg';
import {
	POSTGRES_HOST,
	POSTGRES_PORT,
	POSTGRES_USER,
	POSTGRES_PASSWORD,
	POSTGRES_DB
} from '$env/static/private';

const pool = new pg.Pool({
	host: POSTGRES_HOST || 'db',
	port: Number(POSTGRES_PORT || 5432),
	user: POSTGRES_USER,
	password: POSTGRES_PASSWORD,
	database: POSTGRES_DB,
	options: `-c search_path=${POSTGRES_DB}}`
});

/** Signals a database constraint violation (foreign key, uniqueness, check), same role as the
 *  in-memory mock's `ConstraintError` it replaces. `db.ts` re-exports this. */
export class ConstraintError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ConstraintError';
	}
}

// https://www.postgresql.org/docs/current/errcodes-appendix.html
const CONSTRAINT_CODES = new Set([
	'23505', // unique_violation — dup label
	'23503', // foreign_key_violation — bad ref on insert/update, or RESTRICT-blocked delete
	'23514' // check_violation — events' XOR / null-implies-null checks
]);

function wrap_error(err: unknown): unknown {
	if (err instanceof Error && 'code' in err) {
		const code = (err as Error & { code?: string }).code;
		if (code && CONSTRAINT_CODES.has(code)) {
			const detail = 'detail' in err ? (err as { detail?: string }).detail : undefined;
			return new ConstraintError(detail ?? err.message);
		}
	}
	return err;
}

export async function query<T extends pg.QueryResultRow = Record<string, unknown>>(
	sql: string,
	params: unknown[] = []
): Promise<pg.QueryResult<T>> {
	try {
		return await pool.query<T>(sql, params);
	} catch (err) {
		throw wrap_error(err);
	}
}
