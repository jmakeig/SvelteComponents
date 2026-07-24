#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
env_file="$script_dir/../.devcontainer/.env"

if [[ -f "$env_file" ]]; then
	set -a
	# shellcheck disable=SC1090
	source "$env_file"
	set +a
fi

export PGPASSWORD="${POSTGRES_PASSWORD:-}"

psql \
	--host="${POSTGRES_HOST:-db}" \
	--port="${POSTGRES_PORT:-5432}" \
	--username="${POSTGRES_USER}" \
	--dbname="${POSTGRES_DB}" \
	--file="$script_dir/schema.sql" \
	--file="$script_dir/seed.sql"
