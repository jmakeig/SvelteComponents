INSERT INTO segments (segment, name) VALUES
	('select', 'Select'),
	('enterprise', 'Enterprise'),
	('corporate', 'Corporate'),
	('smb', 'SMB')
ON CONFLICT (segment) DO NOTHING;
