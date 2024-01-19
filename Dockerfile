# Dockerfile

# Build Env
FROM node:18.18-alpine as build

WORKDIR /profile-web

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

RUN npm run build

# Prod Env
FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html

COPY --from=build /profile-web/build .

COPY --from=build /profile-web/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]