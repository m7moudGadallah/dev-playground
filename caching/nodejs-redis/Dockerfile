# BASE IMAGE
FROM node:18-alpine

# SET WORKING DIRECTORY
WORKDIR /home/node/app

# COPY package.json and package-lock.json
COPY package*.json ./

# INSTALL DEPENDENCIES
RUN npm install

# EXPOSE PORT
EXPOSE 4000

# RUN COMMAND
CMD ["npm", "run", "start"]
