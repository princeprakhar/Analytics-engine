FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Prisma client generation is safe at build time
RUN npx prisma generate

EXPOSE 8080

# Run migrations and then start the server
CMD npx prisma migrate deploy && npm start
