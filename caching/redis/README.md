# PALY WITH REDIS

This is a simple redis setup with docker-compose.

## USAGE

```bash
docker-compose up

# Download RedisInsight from https://redislabs.com/redisinsight/
# Connect to redis using the following connection string <redis://localhost:6379> with password <password>

# Connect to redis using redis-cli
docker compose exec -it redis redis-cli -h 127.0.0.1 -p 6379 -a password
```
