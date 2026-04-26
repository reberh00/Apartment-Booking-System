# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generiraj Prisma klijent
RUN npx prisma generate

EXPOSE 3000

# Pokreni migracije pa server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
