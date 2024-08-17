## DEVELOPMENT STAGE
# BASE IMAGE
FROM node:18-alpine AS development

# SET WORKING DIRECTORY
WORKDIR /home/node/app

# COPY package.json and package-lock.json
COPY package*.json ./

# INSTALL DEPENDENCIES
RUN npm install

# COPY ALL FILES
COPY . .

# EXPOSE PORT
EXPOSE 4000

# RUN COMMAND
CMD ["npm", "run", "start:dev"]

## PRODUCTION STAGE
# BASE IMAGE
FROM node:18-alpine AS production

# SET WORKING DIRECTORY
WORKDIR /home/node/app

# COPY package.json and package-lock.json
COPY package*.json ./

# INSTALL DEPENDENCIES
RUN npm install --only=production

# COPY FILES
COPY . .

# EXPOSE PORT
EXPOSE 4000

# RUN COMMAND
CMD ["npm", "run", "start"]
