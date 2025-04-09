FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps --production

COPY . .

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "start"]