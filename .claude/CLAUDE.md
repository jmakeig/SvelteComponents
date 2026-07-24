
# Conventions

## TypeScript

* Start with TypeScript, not (just) JavaScript
* All names should be `lower_snake_case` unless they’re referencing or aligning with an API that uses a different convention, such as `lowerCamelCase` in standard library

## Database

* All SQL should be `UPPERCASE`
* All names should be `lower_snake_case`, mostly to avoid quoting
* All tables should be the plural form of the entity and the primary key should be the singular (not a generic ID or such)
* Every table must have an explicit primary key. Use UUIDs for synthetic keys, generated as default values. Use natural keys only for things like reference data for a lookup value.
* DDL scripts must be idempotent
