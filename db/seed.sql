INSERT INTO segments (segment, name, ordinal) VALUES
	('select', 'Select', 0),
	('enterprise', 'Enterprise', 1),
	('corporate', 'Corporate', 2),
	('smb', 'SMB', 3)
ON CONFLICT (segment) DO NOTHING;

INSERT INTO stages (stage, name) VALUES
	(0, 'Discovery'),
	(1, 'Qualification'),
	(2, 'Proposal'),
	(3, 'Negotiation'),
	(4, 'Closed Won'),
	(99, 'Closed Lost')
ON CONFLICT (stage) DO NOTHING;
