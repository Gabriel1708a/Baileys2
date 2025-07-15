const { canExecuteCommand, sendPermissionError, sendSuccess, sendError } = require('../utils/messageUtils');
const { saveConfig, loadConfig } = require('../utils/config');

module.exports = {
    name: 'banlinkgp',
    description: 'Ativa/desativa ban automático por links de grupos WhatsApp',
    usage: '!banlinkgp 1/0',
    examples: ['!banlinkgp 1', '!banlinkgp 0'],
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
                const status = config.banlinkgp ? 'ativado' : 'desativado';
                
                await sock.sendMessage(groupId, { 
                    text: `🛑 *SISTEMA BAN LINK DE GRUPOS*\n\n📊 *Status atual:* ${status}\n\n🔧 *Funcionalidade:* Bane automaticamente quem enviar links de grupos WhatsApp\n\nUse:\n• !banlinkgp 1 para ativar\n• !banlinkgp 0 para desativar\n\n⚠️ *ATENÇÃO:* Detecta links chat.whatsapp.com. Administradores são excluídos da regra.` 
                });
                return;
            }
            
            const option = args[0].trim();
            
            if (option !== '1' && option !== '0') {
                await sendError(sock, groupId, 'Use !banlinkgp 1 para ativar ou !banlinkgp 0 para desativar');
                return;
            }
            
            const activate = option === '1';
            
            // Salvar configuração
            const success = await saveConfig(groupId, 'banlinkgp', activate);
            
            if (success) {
                const status = activate ? 'ativado' : 'desativado';
                const emoji = activate ? '🛑' : '❌';
                
                await sendSuccess(sock, groupId, `Sistema ban link de grupos ${status}!\n\n${emoji} *Status:* ${status}\n\n🔧 *Funcionalidade:* ${activate ? 'Banirá automaticamente usuários que enviarem links de grupos WhatsApp' : 'Links de grupos não resultarão em ban automático'}\n\n🔍 *Detecta:* Links chat.whatsapp.com\n\n💡 *Lembre-se:* Administradores nunca são banidos`);
            } else {
                await sendError(sock, groupId, 'Erro ao salvar configuração. Tente novamente.');
            }
            
        } catch (error) {
            console.error('❌ Erro no comando banlinkgp:', error);
            await sendError(sock, groupId, 'Erro ao executar comando. Tente novamente.');
        }
    }
};