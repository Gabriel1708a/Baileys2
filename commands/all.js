const { canExecuteCommand, sendPermissionError, mentionAll } = require('../utils/messageUtils');

module.exports = {
    name: 'all',
    description: 'Menciona todos os participantes do grupo silenciosamente',
    usage: '!all [mensagem]',
    category: 'Comunicação',
    adminOnly: true,
    
    async execute(sock, message, groupId, sender, args) {
        try {
            // Verificar se o usuário é admin
            if (!await canExecuteCommand(sock, groupId, sender)) {
                await sendPermissionError(sock, groupId);
                return;
            }
            
            // Obter mensagem personalizada ou usar padrão
            const customMessage = args.length > 0 ? args.join(' ') : '📣 Atenção pessoal!';
            
            // Mencionar todos
            const success = await mentionAll(sock, groupId, customMessage);
            
            if (!success) {
                await sock.sendMessage(groupId, { 
                    text: '❌ Erro ao mencionar participantes. Tente novamente.' 
                });
            }
            
        } catch (error) {
            console.error('❌ Erro no comando all:', error);
            await sock.sendMessage(groupId, { 
                text: '❌ Erro ao executar comando. Tente novamente.' 
            });
        }
    }
};