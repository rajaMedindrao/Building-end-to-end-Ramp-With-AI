# --- build stage ---------------------------------------------------------
FROM node:20-bookworm-slim AS build
WORKDIR /app

# better-sqlite3 needs a C++ toolchain to compile its native bindings.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
# Builds dist/ (Vite SPA) and the sitemap.
RUN npm run build

# Strip dev-only deps from node_modules so the runtime image is small.
RUN npm prune --omit=dev

# --- runtime stage -------------------------------------------------------
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# libstdc++ is needed at runtime by the better-sqlite3 native module.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libstdc++6 ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist          ./dist
COPY --from=build /app/server        ./server
COPY --from=build /app/package.json  ./package.json

# Cloud Run sets $PORT (default 8080). server/index.js already honors it.
EXPOSE 8080
CMD ["node", "server/index.js"]
