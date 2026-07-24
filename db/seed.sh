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
export PGOPTIONS="-c search_path=pipeline"

start_ms=$(date +%s%3N)

psql \
	--host="${POSTGRES_HOST:-db}" \
	--port="${POSTGRES_PORT:-5432}" \
	--username="${POSTGRES_USER}" \
	--dbname="${POSTGRES_DB}" \
	--file="$script_dir/schema.sql" \
	--file="$script_dir/seed.sql"

end_ms=$(date +%s%3N)
elapsed_ms=$((end_ms - start_ms))
echo "db:seed completed in ${elapsed_ms}ms"
