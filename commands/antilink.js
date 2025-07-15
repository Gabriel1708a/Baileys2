const { canExecuteCommand, sendPermissionError, sendSuccess, sendError } = require('../utils/messageUtils');
const { saveConfig, loadConfig } = require('../utils/config');

module.exports = {
    name: 'antilink',
    description: 'Ativa/desativa sistema anti-link (deleta links)',
    usage: '!antilink 1/0',
    examples: ['!antilink 1', '!antilink 0'],
    category: 'Moderação',
    adminOnly: true,
    
    async execute(sock, message, groupId, sender, args) {
        try {
            // Verificar se o usuário é admin
            if (!await canExecuteCommand(sock, groupId, sender)) {
                await sendPermissionError(sock, groupId);
                return;
            }
            
            // Verificar se o argumento foi fornecido
            if (args.length === 0) {
                const config = await loadConfig(groupId);
                const status = config.antilink ? 'ativado' : 'desativado';
                
                await sock.sendMessage(groupId, { 
                    text: `🧹 *SISTEMA ANTI-LINK*\n\n📊 *Status atual:* ${status}\n\n🔧 *Funcionalidade:* Deleta qualquer link enviado\n\nUse:\n• !antilink 1 para ativar\n• !antilink 0 para desativar\n\n💡 *Obs:* Administradores podem enviar links normalmente` 
                });
                return;
            }
            
            const option = args[0].trim();
            
            if (option !== '1' && option !== '0') {
                await sendError(sock, groupId, 'Use !antilink 1 para ativar ou !antilink 0 para desativar');
                return;
            }
            
            const activate = option === '1';
            
            // Salvar configuração
            const success = await saveConfig(groupId, 'antilink', activate);
            
            if (success) {
                const status = activate ? 'ativado' : 'desativado';
                const emoji = activate ? '✅' : '❌';
                
                await sendSuccess(sock, groupId, `Sistema anti-link ${status}!\n\n${emoji} *Status:* ${status}\n\n🔧 *Funcionalidade:* ${activate ? 'Deletará qualquer link enviado' : 'Links serão permitidos'}\n\n💡 *Lembre-se:* Administradores sempre podem enviar links`);
            } else {
                await sendError(sock, groupId, 'Erro ao salvar configuração. Tente novamente.');
            }
            
        } catch (error) {
            console.error('❌ Erro no comando antilink:', error);
            await sendError(sock, groupId, 'Erro ao executar comando. Tente novamente.');
        }
    }
};