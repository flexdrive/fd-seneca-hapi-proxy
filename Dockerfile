FROM node:8.9.4

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 39999

CMD [ "npm", "start" ]