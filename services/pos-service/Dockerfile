FROM node:18-alpine

# Install curl and OpenSSL for healthcheck and Prisma
RUN apk add --no-cache curl openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client (for Alpine)
RUN npx prisma generate

# Copy source code
COPY . .

# Rebuild if needed
RUN npm run build || true

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3003

# Start command
CMD ["npm", "run", "start:prod"]

