const { canExecuteCommand, sendPermissionError, sendSuccess, sendError } = require('../utils/messageUtils');

module.exports = {
    name: 'abrirgrupo',
    description: 'Abre o grupo para todos os participantes',
    usage: '!abrirgrupo',
    category: 'Controle de Grupo',
    adminOnly: true,
    
    async execute(sock, message, groupId, sender, args) {
        try {
            // Verificar se o usuário é admin
            if (!await canExecuteCommand(sock, groupId, sender)) {
                await sendPermissionError(sock, groupId);
                return;
            }
            
            // Abrir grupo (todos podem enviar mensagens)
            await sock.groupSettingUpdate(groupId, 'not_announcement');
            
            await sendSuccess(sock, groupId, 'Grupo aberto com sucesso!\n\n🔓 Todos os participantes podem enviar mensagens agora.');
            
        } catch (error) {
            console.error('❌ Erro no comando abrirgrupo:', error);
            
            if (error.message.includes('forbidden')) {
                await sendError(sock, groupId, 'Bot não tem permissão para alterar configurações do grupo!');
            } else {
                await sendError(sock, groupId, 'Erro ao abrir grupo. Tente novamente.');
            }
        }
    }
};