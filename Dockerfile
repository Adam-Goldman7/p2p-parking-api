FROM node:argon

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install
RUN npm install mocha chai --save-dev

# Bundle app source
COPY . /usr/src/app

EXPOSE 27017
CMD [ "npm", "test" ]