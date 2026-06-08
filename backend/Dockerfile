FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/build ./build
CMD ["sh", "-c", "node node_modules/.bin/typeorm migration:run -d ./build/database/data-source.js && node ./build/index.js"]
