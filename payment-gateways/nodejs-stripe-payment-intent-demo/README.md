# NODEJS STRIPE CHECKOUT SESSION DEMO

This is a simple Node.js application that demonstrates how to create a Stripe Checkout Session with Webhooks to handle the payment process using the Stripe Node.js SDK.

## FILE STRUCTURE

- `frontend` - Contains the frontend code using ejs template engine with express
- `backend` - Contains the backend code using express
- `docker-compose.yml` - Contains the docker-compose configuration to run the application by building the frontend and backend services

## USAGE

```bash
# Clone Repo
git clone <repo-url>

# Change Directory
cd payment-gateways/nodejs-stripe-payment-intent-demo

# Create .env file in the backend directory by copying the .env.example file and add your Stripe API keys
cp backend/.env.example backend/.env

# Create .env file in the frontend directory by copying the .env.example file and add your Stripe Publishable key
cp frontend/.env.example frontend/.env

# Run Docker Compose
docker-compose up -d

# To view the frontend, open your browser and visit http://localhost:8080 and go to checkout page to make a payment and enter you card details and click on pay button to make a payment and it will redirect you to the success page if the payment is successful or the cancel page if the payment is cancelled, also look at backend container logs to see the payment status

# Stop Docker Compose
docker-compose down
```
