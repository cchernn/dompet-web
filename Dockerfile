# Dockerfile

FROM node:18.18-alpine

WORKDIR /profile-web

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]