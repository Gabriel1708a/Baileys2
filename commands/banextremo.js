const { canExecuteCommand, sendPermissionError, sendSuccess, sendError } = require('../utils/messageUtils');
const { saveConfig, loadConfig } = require('../utils/config');

module.exports = {
    name: 'banextremo',
    description: 'Ativa/desativa ban automático por qualquer link',
    usage: '!banextremo 1/0',
    examples: ['!banextremo 1', '!banextremo 0'],
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
                const status = config.banextremo ? 'ativado' : 'desativado';
                
                await sock.sendMessage(groupId, { 
                    text: `💣 *SISTEMA BAN EXTREMO*\n\n📊 *Status atual:* ${status}\n\n🔧 *Funcionalidade:* Bane automaticamente quem enviar qualquer link\n\nUse:\n• !banextremo 1 para ativar\n• !banextremo 0 para desativar\n\n⚠️ *ATENÇÃO:* Muito rigoroso! Administradores são excluídos da regra.` 
                });
                return;
            }
            
            const option = args[0].trim();
            
            if (option !== '1' && option !== '0') {
                await sendError(sock, groupId, 'Use !banextremo 1 para ativar ou !banextremo 0 para desativar');
                return;
            }
            
            const activate = option === '1';
            
            // Salvar configuração
            const success = await saveConfig(groupId, 'banextremo', activate);
            
            if (success) {
                const status = activate ? 'ativado' : 'desativado';
                const emoji = activate ? '💣' : '❌';
                
                await sendSuccess(sock, groupId, `Sistema ban extremo ${status}!\n\n${emoji} *Status:* ${status}\n\n🔧 *Funcionalidade:* ${activate ? 'Banirá automaticamente qualquer usuário que enviar link' : 'Links não resultarão em ban automático'}\n\n⚠️ *Importante:* ${activate ? 'Muito rigoroso! Use com cautela.' : 'Sistema desativado.'}\n\n💡 *Lembre-se:* Administradores nunca são banidos`);
            } else {
                await sendError(sock, groupId, 'Erro ao salvar configuração. Tente novamente.');
            }
            
        } catch (error) {
            console.error('❌ Erro no comando banextremo:', error);
            await sendError(sock, groupId, 'Erro ao executar comando. Tente novamente.');
        }
    }
};