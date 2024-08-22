# PLAY WITH STRIPE CLI

This is a simple example of how to use the Stripe CLI with docker-compose to try out Stripe's cli tool.

## FILE STRUCTURE

- `docker-compose.yml` - Contains the configuration to run the Docker container.
- `.env.examples` - Contains the environment variables examples which you can use to create `.env` file.

## USAGE

```bash
# Clone Repo
git clone <repo-url>

# Change Directory
cd payment-gateways/play-with-stripe-cli

# Create .env file
cp .env.example .env # and set your Stripe API Key

# Run Docker Compose
docker-compose up -d

# Run Stripe CLI
docker-compose exec stripe-cli stripe login

# Stop Docker Compose
docker-compose down
```
