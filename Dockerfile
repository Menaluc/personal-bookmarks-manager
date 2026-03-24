# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

RUN npm install && npm install --prefix server && npm install --prefix client

# Copy source and build frontend into server/public.
COPY . .
RUN npm run build

# Railway provides PORT at runtime.
ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start"]
