INSERT INTO segments (segment, name) VALUES
	('select', 'Select'),
	('enterprise', 'Enterprise'),
	('corporate', 'Corporate'),
	('smb', 'SMB')
ON CONFLICT (segment) DO NOTHING;

INSERT INTO stages (stage, name) VALUES
	(0, 'Discovery'),
	(1, 'Qualification'),
	(2, 'Proposal'),
	(3, 'Negotiation'),
	(4, 'Closed Won'),
	(99, 'Closed Lost')
ON CONFLICT (stage) DO NOTHING;
