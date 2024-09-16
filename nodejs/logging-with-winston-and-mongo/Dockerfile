# BASE IMAGE
FROM node:22-alpine

# SET WORKING DIRECTORY
WORKDIR /home/node/app

# COPY package.json
COPY package.json yarn.lock ./

# INSTALL DEPENDENCIES
RUN yarn install

# EXPOSE PORT
EXPOSE 3000

CMD ["yarn", "run", "start"]