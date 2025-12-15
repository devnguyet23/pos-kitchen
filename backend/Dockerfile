# Base image - using bullseye-slim for Prisma OpenSSL compatibility
FROM node:18-bullseye-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy local code to the container image.
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the app
RUN npm run build

# Expose the listening port
EXPOSE 3001

# Run the app
CMD ["npm", "run", "start:prod"]
