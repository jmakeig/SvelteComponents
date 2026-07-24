

## Database

Conventions

* All SQL should be `UPPERCASE`
* All names should be `lower_snake_case` (to avoid quoting)
* All tables should be the plural form of the entity and the primary key should be the singular (not a generic ID or such)
* UUIDs for synthetic keys, generated as default values
* Every table must have a primary key
* DDL scripts must be idempotent
