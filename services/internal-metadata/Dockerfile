FROM node:20-bookworm-slim
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src
RUN groupadd -r decoy && useradd -r -g decoy -d /app decoy && chown -R decoy:decoy /app
USER decoy
EXPOSE 8080
CMD ["node", "src/index.js"]
