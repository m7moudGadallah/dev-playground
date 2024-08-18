# NODEJS WITH REDIS

This is a simple example of a NodeJS application that uses Redis as a cache with Docker.

## Setup

```bash
# Clone the repository
git clone <repository-url>

# Go to the project directory
cd /caching/nodejs-redis

# Use Docker Compose to build the image and run the container
docker-compose up -d

# Access the application
http://localhost:3000

# To stop the container
docker-compose down
```

## Docker Setup Visual Representation

![Docker Setup](./imgs/docker-setup.png)

## Application

The application is a simple API build with NodeJS that uses Redis as a cache. The API has two routes:

- `POST /`: Set a key-value pair in the cache with different types of data
  - `key`: The key to be stored in the cache
  - `value`: The value to be stored in the cache
  - `type`: The type of the value to be stored in the cache. The possible values are: `string`, `list`, `set`, `hash`
  - `expire`: The time in seconds that the key will be stored in the cache
- `GET /:key`: Get the value of a key in the cache
- `DEL /:key`: Delete a key in the cache.

> You can test the API using the `Postman` or `Insomnia` tools, or use `rest-client` extension in Visual Studio Code and use the `requests.rest` file in the project.
