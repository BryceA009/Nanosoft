#!/bin/bash

# Connection parameters
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

# Path to your DDL SQL file (passed as a parameter)
DDL_FILE="$1"

# Check if the DDL file parameter was provided
if [ -z "$DDL_FILE" ]; then
  echo "Usage: $0 <path_to_ddl_file>" >&2
  exit 1
fi

# Check if the DDL file exists
if [ ! -f "$DDL_FILE" ]; then
  echo "Error: DDL file '$DDL_FILE' not found." >&2
  exit 1
fi

export PGPASSWORD='BryceA09'
psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -f "$DDL_FILE" \
  --set ON_ERROR_STOP=1

# Check for errors
if [ $? -eq 0 ]; then
  echo "DDL executed successfully using file: $DDL_FILE"
else
  echo "Error executing DDL using file: $DDL_FILE" >&2
  exit 1
fi