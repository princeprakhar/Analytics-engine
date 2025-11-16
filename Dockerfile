FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Run migrations automatically on deploy
RUN npx prisma migrate deploy

EXPOSE 8080

CMD ["npm", "start"]
