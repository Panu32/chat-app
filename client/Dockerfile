# --- Stage 1: Build the application ---
FROM node:18-alpine AS builder

WORKDIR /app
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Serve the application ---
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# --- ADD THIS LINE ---
# Copy the custom Nginx configuration to the container
COPY nginx.conf /etc/nginx/conf.d/default.conf
# --------------------

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]