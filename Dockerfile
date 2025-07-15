# Use Node.js 18 Alpine para um container mais leve
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY . .

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Criar diretórios necessários
RUN mkdir -p sessions config data
RUN chown -R nodejs:nodejs /app

# Trocar para usuário não-root
USER nodejs

# Expor porta (se necessário para APIs futuras)
EXPOSE 3000

# Comando para iniciar o bot
CMD ["npm", "start"]

# Adicionar healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Bot running')" || exit 1

# Labels para metadados
LABEL maintainer="Bot Admin WhatsApp"
LABEL version="1.0.0"
LABEL description="Bot Administrador para Grupos WhatsApp"