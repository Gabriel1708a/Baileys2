# 📋 Guia de Instalação - Bot Admin WhatsApp

## ⚡ Instalação Rápida

### 1️⃣ **Pré-requisitos**
```bash
# Verificar se o Node.js está instalado (versão 16 ou superior)
node --version

# Verificar se o npm está instalado
npm --version
```

### 2️⃣ **Clonar e Instalar**
```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd bot-admin-whatsapp

# Instalar dependências
npm install
```

### 3️⃣ **Primeira Execução**
```bash
# Iniciar o bot
npm start
```

### 4️⃣ **Configurar WhatsApp**
1. O bot solicitará o número de telefone
2. Digite no formato: `5511999999999`
3. O bot gerará um código de 8 dígitos
4. **Envie este código para o número do bot no WhatsApp**
5. O bot será conectado automaticamente

## 🔧 Configuração Avançada

### Arquivo .env (Opcional)
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas configurações
nano .env
```

### Configurações Disponíveis
```bash
BOT_PHONE=5511999999999
TIMEZONE=America/Sao_Paulo
NODE_ENV=production
```

## 🚀 Comandos de Execução

```bash
# Iniciar em produção
npm start

# Iniciar em desenvolvimento (com auto-reload)
npm run dev

# Execução direta (sem verificações)
npm run direct
```

## 🛠️ Solução de Problemas

### ❌ Erro: "node_modules não encontrado"
```bash
npm install
```

### ❌ Erro: "Código de pareamento inválido"
1. Verifique se o número está correto
2. Tente gerar um novo código
3. Certifique-se de que o WhatsApp está funcionando

### ❌ Erro: "Bot não tem permissão"
1. Adicione o bot como administrador do grupo
2. Certifique-se de que o bot tem permissões necessárias

### ❌ Erro: "Porta já em uso"
1. Verifique se outro bot está rodando
2. Feche outros processos do bot

## 📱 Testando o Bot

### 1. Adicionar Bot ao Grupo
- Adicione o número do bot ao grupo
- Torne o bot **administrador** do grupo

### 2. Testar Comandos
```
!menu
!all Teste de marcação
!bv 1
!legendabv Bem-vindo @user ao @group! 🎉
```

### 3. Verificar Logs
- Observe o console para mensagens de erro
- Verifique se os comandos estão funcionando

## 🔄 Deployment

### PM2 (Recomendado)
```bash
# Instalar PM2
npm install -g pm2

# Iniciar bot
pm2 start npm --name "whatsapp-bot" -- start

# Ver logs
pm2 logs whatsapp-bot

# Reiniciar
pm2 restart whatsapp-bot
```

### Docker
```bash
# Construir imagem
docker build -t whatsapp-bot .

# Executar container
docker run -d --name bot whatsapp-bot
```

## 📊 Monitoramento

### Logs do Sistema
```bash
# Ver logs em tempo real
pm2 logs whatsapp-bot --lines 50

# Ver status
pm2 status
```

### Verificar Saúde
- Bot deve mostrar "✅ Conectado ao WhatsApp!"
- Comandos devem responder normalmente
- Reconexão automática deve funcionar

## 🆘 Suporte

### Problemas Comuns
1. **Bot não responde**: Verifique se é admin do grupo
2. **Conexão perdida**: Aguarde reconexão automática
3. **Comandos não funcionam**: Verifique logs de erro

### Logs Úteis
```bash
# Ver últimos logs
pm2 logs whatsapp-bot --lines 100

# Reiniciar se necessário
pm2 restart whatsapp-bot
```

## ✅ Checklist de Instalação

- [ ] Node.js instalado (v16+)
- [ ] Dependências instaladas (`npm install`)
- [ ] Bot iniciado (`npm start`)
- [ ] Número configurado
- [ ] Código de pareamento enviado
- [ ] Conexão estabelecida
- [ ] Bot adicionado ao grupo
- [ ] Bot promovido a administrador
- [ ] Comandos testados

---

🎉 **Parabéns! Seu bot está funcionando!**

Use `!menu` para ver todos os comandos disponíveis.