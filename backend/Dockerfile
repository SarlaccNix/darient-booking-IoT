ARG NODE_VERSION=24.13.0-slim

# Build stage
FROM node:${NODE_VERSION} AS builder
WORKDIR /

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npx tsc -p tsconfig.build.json
RUN npx tsc -p tsconfig.seed.json
RUN test -f dist/main.js || (echo "ERROR: dist/main.js not found after tsc" && ls -la dist/ && exit 1)

# Production stage
FROM node:${NODE_VERSION} AS production
WORKDIR /

ENV NODE_ENV=production

# Install OpenSSL required by Prisma query engine
RUN apt-get update -qq && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /dist ./dist
COPY --from=builder /node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/seed.js && node dist/main"]
