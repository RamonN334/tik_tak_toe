FROM node:10

WORKDIR /usr/frontend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
