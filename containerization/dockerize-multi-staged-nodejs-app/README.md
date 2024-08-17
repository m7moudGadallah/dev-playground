# DOCKERIZE MULTI-STAGED NODEJS APP 🐳

This simple demo to show how to dockerize multi-staged nodejs app by creating simple expressJS application and run it in a Docker container in 2 stages (Development and Production).

## File Structure

- `src/` - Contains the source code of the Node.js application.
- `Dockerfile` - Contains the instructions to build the Docker image.
- `docker-compose-dev.yml` - Contains the configuration to run the Docker container in development mode.
- `docker-compose-prod.yml` - Contains the configuration to run the Docker container in production mode.
- `package.json` - Contains the Node.js application dependencies.
- `.dockerignore` - Contains the files and directories to exclude while building the Docker image.
- `.env` - Contains the development environment variables.
- `prod.env` - Contains the production environment variables.

## Usage

```bash
# Clone Repo
git clone <repo-url>

# Change Directory
cd containerization/dockerize-multi-staged-nodejs-app

# Run Docker Compose in Development Mode
docker-compose -f docker-compose-dev.yml up -d

# Use Browser or curl to test app
curl http://localhost:4000

# Stop Docker Compose
docker-compose -f docker-compose-dev.yml down

# Run Docker Compose in Production Mode
docker-compose -f docker-compose-prod.yml up -d

# Use Browser or curl to test app
curl http://localhost:4000

# Stop Docker Compose
docker-compose -f docker-compose-prod.yml down
```
