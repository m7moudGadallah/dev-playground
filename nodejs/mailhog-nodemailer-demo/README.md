# MAILHOG NODEMAILER DEMO

This is a simple demo using MailHog (as local SMTP server on docker) and Nodemailer to send emails in a Node.js application. The application is a simple REST API that sends an email to a user, look at endpoints in [requests.http](./requrests.http) file.

## USAGE

```bash
# Clone Repo
# Clone Repo
git clone <repo-url>

# Change Directory
cd nodejs/mailhog-nodemailer-demo

# Run Docker Compose
docker-compose up -d

# Test endpoints using Postman or use rest-client in VSCode with `requests.http` file
# Open your browser and go to http://localhost:8025 to see the emails sent

# Stop Docker Compose
docker-compose down
```
