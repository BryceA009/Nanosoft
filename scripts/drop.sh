# Load environment variables from .env
export $(grep -v '^#' .env | xargs)

# Now PGPASSWORD comes from the environment
export PGPASSWORD="$DB_PASSWORD"
psql -U postgres -d db1 -f drop_db.sql