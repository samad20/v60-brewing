FROM node:22-alpine AS build

WORKDIR /app
COPY v60-app/package*.json ./
RUN npm ci
COPY v60-app/ ./
RUN npx ng build --configuration=production

FROM node:22-alpine

WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist/v60-app/browser ./public

EXPOSE 4200
CMD ["serve", "public", "-l", "4200", "-s"]
