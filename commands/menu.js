const { canExecuteCommand, sendPermissionError } = require('../utils/messageUtils');

module.exports = {
    name: 'menu',
    description: 'Mostra lista de comandos disponíveis',
    usage: '!menu',
    category: 'Geral',
    adminOnly: false,
    
    async execute(sock, message, groupId, sender, args) {
        try {
            const menuText = `
📋 *MENU DE COMANDOS - BOT ADMIN*

*📣 COMUNICAÇÃO*
📣 !all – Menciona todos silenciosamente
🗞️ !addads – Cria anúncio automático
📌 !listads – Lista anúncios ativos
🗑️ !rmads – Remove anúncio

*🎉 SORTEIOS*
🎉 !sorteio – Cria sorteio com reações

*🔐 CONTROLE DE GRUPO*
🔓 !abrirgrupo – Abre grupo
🔐 !fechargrupo – Fecha grupo
⏰ !abrirgp HH:MM – Agenda abertura
⏰ !fechargp HH:MM – Agenda fechamento
🗓️ !afgp 0 – Cancela agendamento

*💰 HORÁRIOS PAGANTES*
🎰 !horarios – Envia horário pagante
🕐 !horapg 1/0 – Ativa/desativa automático
⏰ !addhorapg 1h – Define intervalo

*👋 BOAS-VINDAS*
🙌 !bv 1/0 – Ativa/desativa boas-vindas
💬 !legendabv – Personaliza mensagem

*🛡️ MODERAÇÃO*
🔨 !ban – Banir usuário (responder msg)
💣 !banextremo – Ban automático por link
🛑 !banlinkgp – Ban por link de grupo
🧹 !antilinkgp – Deleta link de grupo
🧹 !antilink – Deleta qualquer link

*ℹ️ AJUDA*
📋 !menu – Este menu

🤖 *Bot Admin WhatsApp v1.0*
⚡ *Powered by Baileys*
            `;
            
            await sock.sendMessage(groupId, { text: menuText });
            
        } catch (error) {
            console.error('❌ Erro no comando menu:', error);
            await sock.sendMessage(groupId, { 
                text: '❌ Erro ao exibir menu. Tente novamente.' 
            });
        }
    }
};