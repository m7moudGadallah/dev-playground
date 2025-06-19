# Distributed Lock Demo

This is a simple Distributed Lock demo using Redis, nodejs and expressjs.

## How to use

1. Install Docker & Docker Compose
2. Run the following command
```bash
docker compose up -d --scale node={num_of_nodes} # e.g. to start with 5 nodes `docker compose up -d --scale node=5` 
```
3. Open Docker dashboard or attach terminal and watch logs
4. Connect to redis insights and watch values inserted into the sorted list and also watch lock value (redis connection: "redis://redis:6379").
5. To close every thing run the following command:
```bash
docker compose down --rmi all --volumes --remove-orphans
```