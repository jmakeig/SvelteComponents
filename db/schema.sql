-- Reference data: the fixed set of customer segments. Small, closed enumeration,
-- so `segment` is the code itself (matches `Customer.segment` in entities.ts)
-- rather than a synthetic key nothing would join through.
CREATE TABLE IF NOT EXISTS segments (
	segment TEXT PRIMARY KEY,
	name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
	customer UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	label TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	segment TEXT REFERENCES segments (segment)
);
