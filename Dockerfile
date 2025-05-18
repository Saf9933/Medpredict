# ── Stage 1: Build Frontend ──────────────────────────────
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Production Server ──────────────────────────
FROM node:18-alpine
WORKDIR /app

# Copy backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY backend/ ./backend/
COPY data/ ./data/

# Copy built frontend into backend static
COPY --from=frontend-build /app/frontend/dist ./backend/public

EXPOSE 5032

ENV NODE_ENV=production
CMD ["node", "backend/server.js"]
