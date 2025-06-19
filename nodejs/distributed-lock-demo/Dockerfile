FROM node:20-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies (this layer will be cached unless package files change)
RUN npm install --production

# Copy the rest of the application
COPY .env .
COPY ./src ./src

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]

# Command to run the application
CMD ["npm", "start"]