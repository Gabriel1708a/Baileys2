const { canExecuteCommand, sendPermissionError, sendSuccess, sendError } = require('../utils/messageUtils');

module.exports = {
    name: 'fechargrupo',
    description: 'Fecha o grupo (apenas admins podem enviar mensagens)',
    usage: '!fechargrupo',
    category: 'Controle de Grupo',
    adminOnly: true,
    
    async execute(sock, message, groupId, sender, args) {
        try {
            // Verificar se o usuário é admin
            if (!await canExecuteCommand(sock, groupId, sender)) {
                await sendPermissionError(sock, groupId);
                return;
            }
            
            // Fechar grupo (apenas admins podem enviar mensagens)
            await sock.groupSettingUpdate(groupId, 'announcement');
            
            await sendSuccess(sock, groupId, 'Grupo fechado com sucesso!\n\n🔐 Apenas administradores podem enviar mensagens agora.');
            
        } catch (error) {
            console.error('❌ Erro no comando fechargrupo:', error);
            
            if (error.message.includes('forbidden')) {
                await sendError(sock, groupId, 'Bot não tem permissão para alterar configurações do grupo!');
            } else {
                await sendError(sock, groupId, 'Erro ao fechar grupo. Tente novamente.');
            }
        }
    }
};