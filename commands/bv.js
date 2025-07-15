const { canExecuteCommand, sendPermissionError, sendSuccess, sendError } = require('../utils/messageUtils');
const { saveConfig, loadConfig } = require('../utils/config');

module.exports = {
    name: 'bv',
    description: 'Ativa/desativa sistema de boas-vindas',
    usage: '!bv 1/0',
    examples: ['!bv 1', '!bv 0'],
    category: 'Boas-vindas',
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
                const status = config.welcome ? 'ativado' : 'desativado';
                
                await sock.sendMessage(groupId, { 
                    text: `🙌 *SISTEMA DE BOAS-VINDAS*\n\n📊 *Status atual:* ${status}\n\nUse:\n• !bv 1 para ativar\n• !bv 0 para desativar\n• !legendabv para personalizar mensagem` 
                });
                return;
            }
            
            const option = args[0].trim();
            
            if (option !== '1' && option !== '0') {
                await sendError(sock, groupId, 'Use !bv 1 para ativar ou !bv 0 para desativar');
                return;
            }
            
            const activate = option === '1';
            
            // Salvar configuração
            const success = await saveConfig(groupId, 'welcome', activate);
            
            if (success) {
                const status = activate ? 'ativado' : 'desativado';
                const emoji = activate ? '✅' : '❌';
                
                await sendSuccess(sock, groupId, `Sistema de boas-vindas ${status}!\n\n${emoji} *Status:* ${status}\n\n💡 *Dica:* Use !legendabv para personalizar a mensagem de boas-vindas`);
            } else {
                await sendError(sock, groupId, 'Erro ao salvar configuração. Tente novamente.');
            }
            
        } catch (error) {
            console.error('❌ Erro no comando bv:', error);
            await sendError(sock, groupId, 'Erro ao executar comando. Tente novamente.');
        }
    }
};