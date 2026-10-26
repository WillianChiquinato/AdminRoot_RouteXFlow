# ---- Fase de Build ----
FROM node:24-alpine AS builder

WORKDIR /app

# Variáveis VITE_* são embutidas no bundle em tempo de build (import.meta.env),
# então precisam existir aqui. No Coolify, cadastre-as como "Build Variable".
ARG VITE_API_BASE_URL
ARG VITE_BUCKET_STORAGE_URL
ARG VITE_BUCKET_STORAGE_NAME
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_BUCKET_STORAGE_URL=$VITE_BUCKET_STORAGE_URL \
    VITE_BUCKET_STORAGE_NAME=$VITE_BUCKET_STORAGE_NAME

# Copia apenas os ficheiros de dependências primeiro para aproveitar a cache do Docker
COPY package.json yarn.lock ./

# --ignore-scripts: o postinstall (nuxt prepare) precisa do código fonte, que ainda não foi copiado
RUN yarn install --frozen-lockfile --ignore-scripts

# Copia o resto do código fonte do projeto
COPY . .

# Gera os tipos do Nuxt e faz o build de produção
RUN yarn nuxt prepare && yarn build

# ---- Fase de Produção (Leve) ----
FROM node:24-alpine AS runner

WORKDIR /app

# O healthcheck do Coolify roda dentro do container e usa curl
RUN apk add --no-cache curl

# O .output do Nitro já é autocontido (inclui as dependências necessárias)
COPY --from=builder /app/.output ./.output

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
