#!/bin/bash

# Wait for PostgreSQL to start inside the container
until pg_isready -U postgres; do
  echo "Waiting for PostgreSQL to start..."
  sleep 2
done

# Restore the database
pg_restore -U postgres -d dvdrental /docker-entrypoint-initdb.d/dvdrental.tar

echo "Database restore complete."
