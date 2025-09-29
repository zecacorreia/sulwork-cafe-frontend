# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app

# Dependências com cache eficiente
COPY package*.json ./
RUN npm ci

# Código e build (gera dist/sulwork-cafe-web/{browser,server})
COPY . .
RUN npm run build

# ---- runtime ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Só deps de produção para o servidor SSR (express, etc.)
COPY package*.json ./
RUN npm ci --omit=dev

# Copia artefatos de build
COPY --from=build /app/dist ./dist

CMD ["node", "dist/sulwork-cafe-web/server/server.mjs"]