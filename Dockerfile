FROM node:18-alpine

# Create app directory and set permissions
WORKDIR /app

# Create a non-root user (Alpine specific commands)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install build dependencies
RUN apk add --no-cache python3 make g++ postgresql-dev git

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies) for build
RUN npm install --legacy-peer-deps

# Set ownership of the app directory
RUN chown -R appuser:appgroup /app

# Copy source code
COPY --chown=appuser:appgroup . .

# Set build environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application with verbose output
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Switch to non-root user
USER appuser

EXPOSE 3000

CMD ["npm", "start"]
