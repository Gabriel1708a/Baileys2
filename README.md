# 🤖 Bot Administrador WhatsApp

Bot administrador completo para grupos WhatsApp usando **Baileys** (Node.js). Sistema modular, robusto e pronto para produção.

## 🚀 Características

- ✅ Conexão via **código de pareamento** (8 dígitos)
- ✅ Evita QR Code sempre que possível
- ✅ Suporte a múltiplas sessões simultâneas
- ✅ Reconexão automática robusta
- ✅ Sessões persistentes localmente
- ✅ Sistema modular de comandos
- ✅ Preparado para integração com Laravel (API REST)

## 📋 Funcionalidades

### 📣 Comunicação
- `!all` - Menciona todos silenciosamente
- `!addads` - Cria anúncio automático
- `!listads` - Lista anúncios ativos
- `!rmads` - Remove anúncio

### 🎉 Sorteios
- `!sorteio` - Cria sorteio com reações

### 🔐 Controle de Grupo
- `!abrirgrupo` - Abre grupo
- `!fechargrupo` - Fecha grupo
- `!abrirgp HH:MM` - Agenda abertura
- `!fechargp HH:MM` - Agenda fechamento
- `!afgp 0` - Cancela agendamento

### 💰 Horários Pagantes
- `!horarios` - Envia horário pagante

### 👋 Boas-vindas
- `!bv 1/0` - Ativa/desativa boas-vindas
- `!legendabv` - Personaliza mensagem

### 🛡️ Moderação
- `!ban` - Banir usuário (responder msg)
- `!banextremo` - Ban automático por link
- `!banlinkgp` - Ban por link de grupo
- `!antilinkgp` - Deleta link de grupo
- `!antilink` - Deleta qualquer link

### ℹ️ Ajuda
- `!menu` - Lista todos os comandos

## 🛠️ Instalação

### 1. Clonar o repositório
```bash
git clone <url-do-repositorio>
cd bot-admin-whatsapp
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar número do bot
Na primeira execução, o bot solicitará o número de telefone para cadastro.

### 4. Iniciar o bot
```bash
# Produção
npm start

# Desenvolvimento
npm run dev
```

## 🔧 Configuração

### Primeira Execução
1. Execute o bot: `npm start`
2. Digite o número do bot quando solicitado (formato: 5511999999999)
3. O bot gerará um **código de pareamento** de 8 dígitos
4. Envie este código para o número do bot no WhatsApp
5. O bot será conectado automaticamente

### Estrutura de Arquivos
```
bot-admin-whatsapp/
├── commands/           # Comandos modulares
├── config/            # Configurações (criado automaticamente)
├── data/              # Dados de grupos e anúncios
├── sessions/          # Sessões do WhatsApp
├── utils/             # Utilitários
├── index.js           # Arquivo principal
└── package.json       # Dependências
```

## 📝 Uso dos Comandos

### Comandos Administrativos
> **⚠️ Importante:** Apenas administradores do grupo podem usar os comandos.

### Sistema de Anúncios
```bash
# Criar anúncio que repete a cada 30 minutos
!addads Bem-vindos ao nosso grupo!|30m

# Listar anúncios ativos
!listads

# Remover anúncio pelo ID
!rmads 1672531200000
```

### Sistema de Sorteios
```bash
# Sorteio de R$ 100 com duração de 2 minutos
!sorteio 100 reais|2m

# Sorteio de iPhone com duração de 5 minutos
!sorteio iPhone 15|5m
```

### Controle de Grupo
```bash
# Abrir grupo imediatamente
!abrirgrupo

# Fechar grupo imediatamente
!fechargrupo

# Agendar abertura às 8:00 todos os dias
!abrirgp 08:00

# Agendar fechamento às 20:00 todos os dias
!fechargp 20:00

# Cancelar todos os agendamentos
!afgp 0
```

### Sistema de Boas-vindas
```bash
# Ativar boas-vindas
!bv 1

# Desativar boas-vindas
!bv 0

# Personalizar mensagem (use @user e @group)
!legendabv Bem-vindo ao @group, @user! Leia as regras! 🎉
```

### Sistema de Moderação
```bash
# Ativar anti-link (deleta qualquer link)
!antilink 1

# Ativar anti-link de grupos (deleta apenas links de grupos)
!antilinkgp 1

# Ativar ban extremo (bane por qualquer link)
!banextremo 1

# Ativar ban por link de grupo
!banlinkgp 1

# Banir usuário (responder mensagem do usuário)
!ban
```

## 🔄 Integração com Laravel (Futuro)

O bot está preparado para integração com painel Laravel via API REST:

### Endpoints Planejados
- `GET /api/groups` - Lista grupos
- `GET /api/groups/{id}/status` - Status do grupo
- `POST /api/groups/{id}/settings` - Atualizar configurações
- `POST /api/groups/{id}/message` - Enviar mensagem
- `GET /api/groups/{id}/ads` - Listar anúncios
- `POST /api/groups/{id}/ads` - Criar anúncio

### Estrutura de Dados
```javascript
// Exemplo de configuração salva
{
  "groupId": "558899999999-111111@g.us",
  "welcome": true,
  "welcomeMessage": "Bem-vindo @user!",
  "antilink": false,
  "horarios": true,
  "active": true
}
```

## 🐛 Troubleshooting

### Bot não conecta
1. Verifique se o número está correto
2. Certifique-se de que o WhatsApp está funcionando
3. Tente gerar novo código de pareamento

### Comandos não funcionam
1. Verifique se o usuário é administrador
2. Certifique-se de que o bot é administrador do grupo
3. Verifique os logs para erros

### Erro de permissão
1. Torne o bot administrador do grupo
2. Certifique-se de que o bot tem permissões necessárias

## 📊 Logs

O bot registra automaticamente:
- Conexões e desconexões
- Comandos executados
- Erros e problemas
- Atividades de grupos

## 🔒 Segurança

- Sessões criptografadas localmente
- Verificação de permissões por comando
- Proteção contra spam
- Logs de segurança

## 🚀 Deployment

### Usando PM2
```bash
# Instalar PM2
npm install -g pm2

# Iniciar bot
pm2 start index.js --name "whatsapp-bot"

# Ver status
pm2 status

# Ver logs
pm2 logs whatsapp-bot
```

### Usando Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["npm", "start"]
```

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas e suporte, abra uma issue no repositório.

---

**⚡ Powered by Baileys** | **🤖 Bot Admin WhatsApp v1.0**