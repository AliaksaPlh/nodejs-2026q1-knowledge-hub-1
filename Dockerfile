# Stage 1: dependencies + TypeScript compile (Node.js 24.10+)
FROM node:24.10.0-alpine AS build

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN npm run build

# Stage 2: minimal production image (assignment: node:24-alpine)
FROM node:24.10.0-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache curl

COPY package.json package-lock.json ./
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
  && npm ci --omit=dev \
  && apk del .build-deps \
  && npm cache clean --force

COPY --from=build /app/dist ./dist

RUN chown -R node:node /app
USER node

EXPOSE 4000

CMD ["node", "dist/main.js"]
