#!/bin/sh
set -e  # Exit immediately if a command fails

echo "Running Prisma Migrations..."
pnpm prisma migrate deploy

echo "Ensuring logs directory exists..."
mkdir -p ./logs

echo "Setting up PM2 log rotation..."
if ! pm2 module:list | grep -q 'pm2-logrotate'; then
  pm2 install pm2-logrotate
  pm2 set pm2-logrotate:max_size 10M
  pm2 set pm2-logrotate:retain 7
  pm2 set pm2-logrotate:compress true
fi

echo "Starting Application with PM2..."
pm2-runtime start ecosystem.config.js 