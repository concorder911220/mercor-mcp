# Build stage
FROM public.ecr.aws/docker/library/node:22-alpine AS build

# VITE_API_BASE_URL is only necessary when running locally.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /app

# Install TypeScript globally for workspace builds
RUN npm install -g typescript

# Set up workspace structure
COPY package.json ./
COPY packages/design-tokens/package.json packages/design-tokens/
COPY packages/theme/package.json packages/theme/
COPY packages/ui/package.json packages/ui/
COPY apps/frontend/package*.json apps/frontend/

# Install all workspace dependencies
RUN npm install

# Copy workspace package sources and build them
COPY packages/design-tokens packages/design-tokens
RUN cd packages/design-tokens && tsc -p tsconfig.json

COPY packages/theme packages/theme
RUN cd packages/theme && tsc -p tsconfig.json

COPY packages/ui packages/ui
RUN cd packages/ui && tsc -p tsconfig.json

# Copy frontend source files (excluding node_modules)
COPY apps/frontend/src apps/frontend/src
COPY apps/frontend/public apps/frontend/public
COPY apps/frontend/index.html apps/frontend/
COPY apps/frontend/vite.config.js apps/frontend/
COPY apps/frontend/tsconfig*.json apps/frontend/

# Build the frontend application
RUN cd apps/frontend && npm run build

# Production stage
FROM public.ecr.aws/nginx/nginx:alpine

# Copy built application from build stage
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/frontend/nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
