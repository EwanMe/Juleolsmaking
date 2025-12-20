FROM node:18-alpine AS prod
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine3.23-slim
WORKDIR /usr/share/nginx/html
COPY --from=prod /app/build .
EXPOSE 80

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]