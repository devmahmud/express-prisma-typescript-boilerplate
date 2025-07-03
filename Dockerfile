FROM node:20-slim

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
COPY prisma ./prisma/
RUN yarn install --frozen-lockfile

# Install pm2 globally
RUN yarn global add pm2

# Copy the rest of the code
COPY . .

# Generate Prisma client and build the app
RUN yarn prisma generate
RUN yarn build

# Add and configure entrypoint
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Use the entrypoint script as CMD
CMD ["sh", "./entrypoint.sh"]