const { canExecuteCommand, sendPermissionError, sendSuccess, sendError, getQuotedMessage, isQuotedMessage } = require('../utils/messageUtils');

module.exports = {
    name: 'ban',
    description: 'Bane usuário (responder mensagem)',
    usage: '!ban (responder uma mensagem)',
    category: 'Moderação',
    adminOnly: true,
    
    async execute(sock, message, groupId, sender, args) {
        try {
            // Verificar se o usuário é admin
            if (!await canExecuteCommand(sock, groupId, sender)) {
                await sendPermissionError(sock, groupId);
                return;
            }
            
            // Verificar se é uma resposta a uma mensagem
            if (!isQuotedMessage(message)) {
                await sendError(sock, groupId, 'Responda a uma mensagem do usuário que deseja banir e digite !ban');
                return;
            }
            
            const quotedMessage = getQuotedMessage(message);
            
            if (!quotedMessage) {
                await sendError(sock, groupId, 'Não foi possível identificar a mensagem citada. Tente novamente.');
                return;
            }
            
            const targetUser = quotedMessage.sender;
            
            if (!targetUser) {
                await sendError(sock, groupId, 'Não foi possível identificar o usuário. Tente novamente.');
                return;
            }
            
            // Verificar se não está tentando banir a si mesmo
            if (targetUser === sender) {
                await sendError(sock, groupId, 'Você não pode banir a si mesmo!');
                return;
            }
            
            // Verificar se o usuário alvo não é admin
            if (await canExecuteCommand(sock, groupId, targetUser)) {
                await sendError(sock, groupId, 'Não é possível banir outro administrador!');
                return;
            }
            
            // Banir usuário
            await sock.groupParticipantsUpdate(groupId, [targetUser], 'remove');
            
            // Obter número do usuário para exibir
            const userNumber = targetUser.split('@')[0];
            
            await sendSuccess(sock, groupId, `Usuário banido com sucesso!\n\n🔨 *Usuário:* @${userNumber}\n👤 *Banido por:* @${sender.split('@')[0]}\n📅 *Data:* ${new Date().toLocaleString('pt-BR')}`);
            
        } catch (error) {
            console.error('❌ Erro no comando ban:', error);
            
            if (error.message.includes('forbidden')) {
                await sendError(sock, groupId, 'Bot não tem permissão para banir usuários! Verifique se o bot é administrador.');
            } else {
                await sendError(sock, groupId, 'Erro ao banir usuário. Tente novamente.');
            }
        }
    }
};