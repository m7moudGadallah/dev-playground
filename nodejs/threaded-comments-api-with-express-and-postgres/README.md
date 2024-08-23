# THREAD COMMENTS API WITH EXPRESSJS AND POSTGRESQL

This simple demo trying to build simple api for threaded comments feature using expressjs, postgres, prisma and docker.
look at the [requests.http](./requrests.http) file to see the available endpoints.

## USAGE

```bash
# Clone Repo
# Clone Repo
git clone <repo-url>

# Change Directory
cd nodejs/threaded-comments-api-with-express-and-postgres

# Run Docker Compose
docker-compose up -d

# Attach Shell to node-app container and do the following steps
# 1. Run `npx prisma migrate dev` to apply migrations
# 2. Run `npx prisma db pull` to pull views and tables
# 3. Run `npx prisma generate` to generate prisma client
# 3. Run `npm run seed` to seed the database with sample data

# Test endpoints using Postman or use rest-client in VSCode with `requests.http` file

# Stop Docker Compose
docker-compose down
```
