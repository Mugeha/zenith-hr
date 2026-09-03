FROM node:20-bookworm-slim AS deps

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       python3 make g++ pkg-config libxml2-dev libxslt1-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev && npm install prisma --no-save

COPY prisma ./prisma
RUN npx prisma generate

FROM node:20-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       wkhtmltopdf ca-certificates libxml2 libxslt1.1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY package.json ./
COPY src ./src

RUN mkdir -p /app/uploads \
    && groupadd -r zenith && useradd -r -g zenith -d /app zenith \
    && chown -R zenith:zenith /app

USER zenith

EXPOSE 4000

CMD ["node", "src/server.js"]
