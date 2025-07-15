const { canExecuteCommand, sendPermissionError, sendSuccess, sendError } = require('../utils/messageUtils');
const { saveConfig, loadConfig } = require('../utils/config');

module.exports = {
    name: 'antilinkgp',
    description: 'Ativa/desativa sistema anti-link de grupos (deleta links de grupos)',
    usage: '!antilinkgp 1/0',
    examples: ['!antilinkgp 1', '!antilinkgp 0'],
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
                const status = config.antilinkgp ? 'ativado' : 'desativado';
                
                await sock.sendMessage(groupId, { 
                    text: `🧹 *SISTEMA ANTI-LINK DE GRUPOS*\n\n📊 *Status atual:* ${status}\n\n🔧 *Funcionalidade:* Deleta apenas links de grupos WhatsApp\n\nUse:\n• !antilinkgp 1 para ativar\n• !antilinkgp 0 para desativar\n\n💡 *Obs:* Administradores podem enviar links normalmente` 
                });
                return;
            }
            
            const option = args[0].trim();
            
            if (option !== '1' && option !== '0') {
                await sendError(sock, groupId, 'Use !antilinkgp 1 para ativar ou !antilinkgp 0 para desativar');
                return;
            }
            
            const activate = option === '1';
            
            // Salvar configuração
            const success = await saveConfig(groupId, 'antilinkgp', activate);
            
            if (success) {
                const status = activate ? 'ativado' : 'desativado';
                const emoji = activate ? '✅' : '❌';
                
                await sendSuccess(sock, groupId, `Sistema anti-link de grupos ${status}!\n\n${emoji} *Status:* ${status}\n\n🔧 *Funcionalidade:* ${activate ? 'Deletará links de grupos WhatsApp (chat.whatsapp.com)' : 'Links de grupos serão permitidos'}\n\n💡 *Lembre-se:* Administradores sempre podem enviar links`);
            } else {
                await sendError(sock, groupId, 'Erro ao salvar configuração. Tente novamente.');
            }
            
        } catch (error) {
            console.error('❌ Erro no comando antilinkgp:', error);
            await sendError(sock, groupId, 'Erro ao executar comando. Tente novamente.');
        }
    }
};