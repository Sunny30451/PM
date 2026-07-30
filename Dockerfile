# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.18.0

FROM node:${NODE_VERSION}-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY index.html main.jsx app.jsx vite.config.js ./
COPY src ./src

RUN npm run build

FROM node:${NODE_VERSION}-bookworm-slim AS runtime

ENV NODE_ENV=production \
    API_HOST=0.0.0.0 \
    API_PORT=3000 \
    DATABASE_PATH=/app/data/modulpro.sqlite

WORKDIR /app

COPY --chown=node:node package.json ./
COPY --chown=node:node server/config.js server/database.js server/healthcheck.js server/server.js ./server/
COPY --from=build --chown=node:node /app/dist ./dist

RUN install -d -o node -g node /app/data

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["node", "server/healthcheck.js"]

STOPSIGNAL SIGTERM

CMD ["node", "server/server.js"]
