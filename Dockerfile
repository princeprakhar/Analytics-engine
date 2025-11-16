FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Prisma needs to be generated inside container
RUN npx prisma generate

EXPOSE 8080

CMD ["npm", "start"]

