FROM node:10

WORKDIR /usr/backend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8001

CMD ["npm", "start"]
