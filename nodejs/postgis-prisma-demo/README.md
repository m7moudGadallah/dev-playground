# POSTGIS DEMO WITH PRISMA AND EXPRESSJS

This is a simple demo using PostGIS with Prisma and ExpressJS. by building simple api for searching for restaurants within a certain radius.
look at the [requests.http](./requrests.http) file to see the available endpoints.

## USAGE

```bash
# Clone Repo
# Clone Repo
git clone <repo-url>

# Change Directory
cd nodejs/postgis-prisma-demo

# Run Docker Compose
docker-compose up -d

# Attach Shell to node-app container and do the following steps
# 1. Run `npx prisma migrate dev` to apply migrations
# 3. Run `npx prisma generate` to generate prisma client
# 3. Run `npm run seed` to seed the database with sample data

# Test endpoints using Postman or use rest-client in VSCode with `requests.http` file

# Stop Docker Compose
docker-compose down
```
