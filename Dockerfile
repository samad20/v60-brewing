FROM node:22-alpine AS build

WORKDIR /app
COPY v60-app/package*.json ./
RUN npm ci
COPY v60-app/ ./
RUN npx ng build --configuration=production

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/v60-app/browser /usr/share/nginx/html

# Nginx config with gzip + caching + SPA routing
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
