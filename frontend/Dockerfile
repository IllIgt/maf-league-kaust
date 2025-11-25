FROM node:20 AS build

WORKDIR /app

# Копируем package.json и (если есть) package-lock.json
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]