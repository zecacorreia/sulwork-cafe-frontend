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

# Porta: server.ts normalmente usa process.env.PORT || 4000
ENV PORT=4000
EXPOSE 4000

# Se quiser apontar sua API no runtime:
# ENV API_URL=https://sua-api.aqui

CMD ["node", "dist/sulwork-cafe-web/server/server.mjs"]