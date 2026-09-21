# ==========================================
# RoshnaMart Frontend Dockerfile
# Multi-stage build for React 19 + Vite + Nginx
# ==========================================

# ------------------------------------------
# Stage 1: Build static assets with Node.js
# ------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install project dependencies
RUN npm ci

# Copy application source code
COPY . .

# Accept build-time API Base URL argument (defaults to empty string for Nginx proxy routing)
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build optimized production distribution
RUN npm run build

# ------------------------------------------
# Stage 2: Lightweight Nginx Production Server
# ------------------------------------------
FROM nginx:alpine AS runner

# Copy custom Nginx configuration with SPA support & reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
