# PLAY WITH POSTGRES

This is a simple setup to play with postgres database using docker and practice some queries using `dvdrental` database.

## USAGE

```bash
# Clone Repo
git clone <repo-url>

# Change Directory
cd databases/postgres/play-with-postgres

# Run Docker Compose
docker-compose up -d

# Connect to Postgres
docker-compose exec postgres psql -U postgres -d dvdrental

# Run Queries

# Stop Docker Compose

```

> **_Note:_** you can use any postgres client to or pgadmin to connect to the database from `localhost:5433`
