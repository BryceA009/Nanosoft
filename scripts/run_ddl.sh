#!/bin/bash

# Load environment variables from .env
export $(grep -v '^#' .env | xargs)


# DB_HOST=Insert your host here
# DB_PORT=Insert your port here
# DB_NAME=Insert your name here
# DB_USER=Insert your user here
# DB_PASSWORD=insert your password here

# Path to your DDL SQL file (passed as a parameter)
DDL_FILE="$1"

if [ -z "$DDL_FILE" ]; then
  echo "Usage: $0 <path_to_ddl_file>" >&2
  exit 1
fi

if [ ! -f "$DDL_FILE" ]; then
  echo "Error: DDL file '$DDL_FILE' not found." >&2
  exit 1
fi

# Pass password to psql via environment
export PGPASSWORD="$DB_PASSWORD"

psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -f "$DDL_FILE" \
  --set ON_ERROR_STOP=1

if [ $? -eq 0 ]; then
  echo "DDL executed successfully using file: $DDL_FILE"
else
  echo "Error executing DDL using file: $DDL_FILE" >&2
  exit 1
fi