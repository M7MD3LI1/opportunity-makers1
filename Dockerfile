# =============================================
# Stage 1: Build Frontend
# =============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy source and build
COPY frontend/ ./
RUN npm run build

# =============================================
# Stage 2: Build Backend
# =============================================
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Install dependencies
COPY backend/package*.json ./
RUN npm ci

# Copy source
COPY backend/ ./

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript
RUN npm run build

# =============================================
# Stage 3: Production Image
# =============================================
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy compiled backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules/.prisma ./backend/node_modules/.prisma
COPY --from=backend-builder /app/backend/prisma ./backend/prisma

# Copy frontend build into backend's static folder
COPY --from=frontend-builder /app/frontend/dist ./backend/dist/public

# Create uploads directory
RUN mkdir -p ./backend/uploads

# Set working directory to backend
WORKDIR /app/backend

# Expose port
EXPOSE 5000

# Run DB push + seed + start server
CMD sh -c "npx prisma db push --accept-data-loss && node dist/index.js"
