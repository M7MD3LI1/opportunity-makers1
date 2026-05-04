# =============================================
# Stage 1: Build Frontend
# =============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# =============================================
# Stage 2: Build Backend
# =============================================
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./

# Generate Prisma client for PostgreSQL
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

WORKDIR /app/backend

EXPOSE 5000

# Run Prisma migrations then start the server
CMD sh -c "npx prisma migrate deploy && node dist/index.js"
