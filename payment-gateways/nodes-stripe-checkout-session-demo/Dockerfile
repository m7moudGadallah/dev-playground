# BASE IMAGE
FROM node:18-alpine AS development

# SET WORKING DIRECTORY
WORKDIR /home/node/app

# COPY package.json
COPY package.json .

# INSTALL DEPENDENCIES
RUN npm install

# EXPOSE PORT
EXPOSE 3000

# RUN COMMAND
CMD ["npm", "run" , "start"]