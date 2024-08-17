# DOCKERIZE NODEJS APP 🐳

This simple demo to show how to dockerize a Node.js application by creating simple expressJS application and run it in a Docker container.

## File Structure

- `src/` - Contains the source code of the Node.js application.
- `Dockerfile` - Contains the instructions to build the Docker image.
- `docker-compose.yml` - Contains the configuration to run the Docker container.
- `package.json` - Contains the Node.js application dependencies.
- `.dockerignore` - Contains the files and directories to exclude while building the Docker image.
- `.env` - Contains the environment variables.

## Usage

```bash
# Clone Repo
git clone <repo-url>

# Change directory
cd containerization/dockerize-nodejs-app

# Run Docker Compose
docker-compose up -d

# Use Browser or curl to test app
curl http://localhost:4000

# Stop Docker Compose
docker-compose down
```
