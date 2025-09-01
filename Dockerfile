# Multi-stage build for Mission Control React app
FROM node:lts-alpine AS build

# Accept build arguments for environment variables
ARG VITE_MAPBOX_ACCESS_TOKEN
ARG VITE_DEV_MODE=false
ARG NODE_ENV=production

# Set environment variables from build args
ENV VITE_MAPBOX_ACCESS_TOKEN=$VITE_MAPBOX_ACCESS_TOKEN
ENV VITE_DEV_MODE=$VITE_DEV_MODE
ENV NODE_ENV=$NODE_ENV

# Disable npm update notifications and funding messages
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false

WORKDIR /app

# Copy package files for better Docker layer caching
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci --include=dev

# Copy source code
COPY . ./

# Build the React application
RUN npm run build

# Production stage with Caddy
FROM caddy:alpine

WORKDIR /app

# Copy Caddy configuration
COPY Caddyfile ./

# Format and validate Caddyfile
RUN caddy fmt Caddyfile --overwrite

# Copy built React app from build stage
COPY --from=build /app/dist ./dist

# Expose port (Railway will set PORT environment variable)
EXPOSE 3000

# Start Caddy server
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]