#!/bin/sh
set -e

# Run Prisma migrations on startup
npx prisma migrate deploy

# Start the application
exec node server.js
