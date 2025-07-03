FROM node:20-slim

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
RUN pnpm install --frozen-lockfile

# Install pm2 globally
RUN pnpm add -g pm2

# Copy the rest of the code
COPY . .

# Generate Prisma client and build the app
RUN pnpm prisma generate
RUN pnpm build

# Add and configure entrypoint
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Use the entrypoint script as CMD
CMD ["sh", "./entrypoint.sh"]