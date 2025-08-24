# Dockerfile simplificado para desenvolvimento
FROM node:18-alpine

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar todas as dependências (incluindo dev)
RUN npm ci

# Copiar código fonte
COPY . .

# Desabilitar telemetria
ENV NEXT_TELEMETRY_DISABLED 1

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 3000

# Definir hostname e porta
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Comando para produção
CMD ["node", ".next/standalone/server.js"]
