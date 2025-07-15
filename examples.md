# 📚 Exemplos Práticos - Bot Admin WhatsApp

Este arquivo contém exemplos práticos de como usar cada funcionalidade do bot.

## 📋 Comandos Básicos

### 1. Visualizar Menu
```
!menu
```
**Resultado:** Mostra lista completa de comandos disponíveis

### 2. Mencionar Todos
```
!all
!all Reunião importante em 10 minutos!
```
**Resultado:** Menciona todos os participantes (apenas admins podem usar)

---

## 🗞️ Sistema de Anúncios

### 1. Criar Anúncio
```
!addads Promoção especial hoje!|30m
!addads Lembrete diário de vendas|1h
!addads Boa noite pessoal!|12h
```
**Resultado:** Cria anúncio que repete automaticamente

### 2. Listar Anúncios
```
!listads
```
**Resultado:** Mostra todos os anúncios ativos com IDs

### 3. Remover Anúncio
```
!rmads 1672531200000
```
**Resultado:** Remove anúncio pelo ID

---

## 🎉 Sistema de Sorteios

### 1. Criar Sorteio
```
!sorteio R$ 100|2m
!sorteio iPhone 15 Pro Max|5m
!sorteio Vale-presente de R$ 500|10m
```
**Resultado:** Inicia sorteio com tempo definido

### 2. Participar do Sorteio
- Usuários reagem com ✅ na mensagem do sorteio
- Após o tempo, bot escolhe vencedor automaticamente

---

## 🔐 Controle de Grupo

### 1. Abrir/Fechar Grupo
```
!abrirgrupo
!fechargrupo
```
**Resultado:** Abre/fecha grupo imediatamente

### 2. Agendar Horários
```
!abrirgp 08:00
!fechargp 20:00
```
**Resultado:** Agenda abertura às 8h e fechamento às 20h diariamente

### 3. Cancelar Agendamentos
```
!afgp 0
```
**Resultado:** Cancela todos os agendamentos

---

## 👋 Sistema de Boas-vindas

### 1. Ativar Boas-vindas
```
!bv 1
```
**Resultado:** Ativa mensagem automática para novos membros

### 2. Personalizar Mensagem
```
!legendabv Bem-vindo ao @group, @user! 🎉
!legendabv Olá @user! Leia as regras do @group
!legendabv @user seja bem-vindo! Este é o melhor grupo! 🚀
```
**Resultado:** Personaliza mensagem com variáveis

### 3. Desativar Boas-vindas
```
!bv 0
```
**Resultado:** Desativa sistema de boas-vindas

---

## 💰 Horários Pagantes

### 1. Enviar Horário Atual
```
!horarios
```
**Resultado:** Envia horários sugeridos para apostas

### 2. Configurar Automático
```
!horapg 1
!addhorapg 1h
```
**Resultado:** Ativa envio automático a cada hora

### 3. Desativar Automático
```
!horapg 0
```
**Resultado:** Desativa envio automático

---

## 🛡️ Sistema de Moderação

### 1. Banir Usuário
```
(Responder mensagem do usuário)
!ban
```
**Resultado:** Bane usuário da mensagem citada

### 2. Configurar Anti-link
```
!antilink 1          # Deleta qualquer link
!antilinkgp 1        # Deleta apenas links de grupos
!banextremo 1        # Bane por qualquer link
!banlinkgp 1         # Bane por link de grupo
```
**Resultado:** Configura sistema de moderação

### 3. Desativar Anti-link
```
!antilink 0
!antilinkgp 0
!banextremo 0
!banlinkgp 0
```
**Resultado:** Desativa sistemas de moderação

---

## 🎯 Cenários de Uso

### Cenário 1: Grupo de Vendas
```
# Configurar boas-vindas
!bv 1
!legendabv Bem-vindo @user! Confira nossos produtos! 🛍️

# Criar anúncio de produtos
!addads 🔥 OFERTA ESPECIAL! Produtos com 50% OFF!|2h

# Configurar horários pagantes
!horapg 1
!addhorapg 3h

# Ativar anti-link básico
!antilinkgp 1
```

### Cenário 2: Grupo de Estudos
```
# Configurar boas-vindas
!bv 1
!legendabv Bem-vindo @user ao grupo de estudos! 📚

# Agendar horários de estudos
!abrirgp 19:00
!fechargp 23:00

# Criar lembretes
!addads 📚 Hora de estudar! Vamos focar!|1h

# Moderação rigorosa
!banextremo 1
```

### Cenário 3: Grupo de Entretenimento
```
# Boas-vindas divertidas
!bv 1
!legendabv @user chegou! Bem-vindo ao melhor grupo! 🎉

# Sorteios regulares
!sorteio Netflix Premium|30m
!sorteio R$ 50 PIX|1h

# Anti-link moderado
!antilink 1
```

---

## 🔧 Dicas de Uso

### 1. Configuração Inicial
```
# Sequência recomendada para novos grupos
!bv 1
!legendabv Bem-vindo @user ao @group! 🎉
!antilinkgp 1
!abrirgp 08:00
!fechargp 22:00
```

### 2. Manutenção Regular
```
# Verificar anúncios ativos
!listads

# Limpar anúncios antigos se necessário
!rmads [ID]

# Testar funcionalidades
!all Teste do bot
!sorteio Teste|1m
```

### 3. Troubleshooting
```
# Se bot não responde:
# 1. Verificar se é admin do grupo
# 2. Tentar !menu
# 3. Verificar logs do sistema

# Se comandos não funcionam:
# 1. Verificar permissões do usuário
# 2. Verificar se bot tem permissões
# 3. Tentar reenviar comando
```

---

## 📊 Monitoramento

### Scripts de Manutenção
```bash
# Verificar saúde do bot
npm run health

# Limpar arquivos antigos
npm run cleanup

# Ver logs
npm run pm2-logs
```

### Verificações Regulares
- Status de conexão
- Funcionamento dos comandos
- Logs de erro
- Uso de memória

---

## ⚠️ Importante

1. **Apenas administradores** podem usar comandos administrativos
2. **Bot deve ser administrador** para funcionar completamente
3. **Backup regular** dos dados é recomendado
4. **Monitoramento** constante é essencial

---

**📱 Bot Admin WhatsApp v1.0** | **⚡ Powered by Baileys**