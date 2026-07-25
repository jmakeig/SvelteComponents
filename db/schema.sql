-- This script resets the `pipeline` schema on every run rather than migrating it
-- in place — there's no data worth preserving yet (see db/seed.sql). Revisit once
-- real data exists; at that point "reset" and "seed" stop being the same
-- operation. Scoped to this schema only, so it never touches `public` or other
-- schemas (e.g. a future `auth` schema).
DROP SCHEMA IF EXISTS pipeline CASCADE;
CREATE SCHEMA pipeline;

-- Reference data: the fixed set of customer segments. Small, closed enumeration,
-- so `segment` is the code itself (matches `Customer.segment` in entities.ts)
-- rather than a synthetic key nothing would join through. `ordinal` exists purely
-- to reproduce a fixed display order (e.g. for a `<select>`) — there's no natural
-- column (alphabetical, etc.) that already encodes it.
CREATE TABLE segments (
	segment TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	ordinal SMALLINT NOT NULL
);

CREATE TABLE customers (
	customer UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	label TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	segment TEXT REFERENCES segments (segment)
);

-- Reference data: the fixed set of workload stages. Same natural-key shape as
-- `segments` — `stage` is the ordering value itself (matches `Stage.value` in
-- entities.ts), not a synthetic key.
CREATE TABLE stages (
	stage SMALLINT PRIMARY KEY,
	name TEXT NOT NULL
);

-- Holds only what a workload is, not its current size/stage — those are derived
-- from `events` history by the `workloads` view below, so there's no cache to
-- keep in sync.
CREATE TABLE workloads_base (
	workload UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	label TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	customer UUID NOT NULL REFERENCES customers (customer)
);

-- `happened_at` is a user-picked local date (see `parse_date_local` in entities.ts),
-- not a timestamp, so same-day entries are routine. `recorded_at` exists purely to
-- break those ties by recording order, mirroring the array-insertion-order tie-break
-- `recompute_workload_snapshot` used in the in-memory implementation. Defaults to
-- `clock_timestamp()`, not `now()` — `now()` is frozen for the whole transaction,
-- so multiple events inserted together would otherwise tie exactly.
--
-- Exactly one of `customer`/`workload` is set, matching the `Event` union in
-- entities.ts. `workload_size`/`workload_stage` only ever apply to workload events;
-- a NULL there means "this event didn't touch that field," not "cleared it" — no
-- event today can express an explicit clear (see `validate_event`), so no separate
-- flag is needed to distinguish the two.
CREATE TABLE events (
	event UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	outcome TEXT NOT NULL,
	happened_at DATE NOT NULL,
	recorded_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
	customer UUID REFERENCES customers (customer),
	workload UUID REFERENCES workloads_base (workload),
	workload_size INTEGER,
	workload_stage SMALLINT REFERENCES stages (stage),
	CHECK (num_nonnulls(customer, workload) = 1),
	CHECK (workload IS NOT NULL OR (workload_size IS NULL AND workload_stage IS NULL))
);

-- Current `size`/`stage` per workload, derived from the latest `events` row that
-- touched each field independently (a size update and a stage update don't have
-- to land on the same event). Ties on `happened_at` resolve to the most recently
-- recorded row, via `recorded_at`.
CREATE VIEW workloads AS
SELECT
	wb.workload,
	wb.label,
	wb.name,
	wb.customer,
	latest_size.workload_size AS size,
	latest_stage.workload_stage AS stage
FROM workloads_base wb
LEFT JOIN LATERAL (
	SELECT e.workload_size
	FROM events e
	WHERE e.workload = wb.workload AND e.workload_size IS NOT NULL
	ORDER BY e.happened_at DESC, e.recorded_at DESC
	LIMIT 1
) latest_size ON TRUE
LEFT JOIN LATERAL (
	SELECT e.workload_stage
	FROM events e
	WHERE e.workload = wb.workload AND e.workload_stage IS NOT NULL
	ORDER BY e.happened_at DESC, e.recorded_at DESC
	LIMIT 1
) latest_stage ON TRUE;
