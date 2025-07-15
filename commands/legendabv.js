const { canExecuteCommand, sendPermissionError, sendSuccess, sendError } = require('../utils/messageUtils');
const { saveConfig, loadConfig } = require('../utils/config');

module.exports = {
    name: 'legendabv',
    description: 'Personaliza mensagem de boas-vindas',
    usage: '!legendabv [mensagem]',
    examples: ['!legendabv Bem-vindo ao @group, @user! 🎉'],
    category: 'Boas-vindas',
    adminOnly: true,
    
    async execute(sock, message, groupId, sender, args) {
        try {
            // Verificar se o usuário é admin
            if (!await canExecuteCommand(sock, groupId, sender)) {
                await sendPermissionError(sock, groupId);
                return;
            }
            
            // Se não foi fornecida mensagem, mostrar mensagem atual
            if (args.length === 0) {
                const config = await loadConfig(groupId);
                const currentMessage = config.welcomeMessage || 'Bem-vindo(a) ao grupo @group, @user! 🎉';
                
                await sock.sendMessage(groupId, { 
                    text: `💬 *MENSAGEM DE BOAS-VINDAS*\n\n📝 *Mensagem atual:*\n${currentMessage}\n\n🔧 *Variáveis disponíveis:*\n• @user - menciona o novo membro\n• @group - nome do grupo\n\n💡 *Exemplo:*\n!legendabv Bem-vindo ao @group, @user! Leia as regras! 🎉` 
                });
                return;
            }
            
            const newMessage = args.join(' ');
            
            if (newMessage.length > 500) {
                await sendError(sock, groupId, 'Mensagem muito longa! Máximo de 500 caracteres.');
                return;
            }
            
            // Salvar nova mensagem
            const success = await saveConfig(groupId, 'welcomeMessage', newMessage);
            
            if (success) {
                await sendSuccess(sock, groupId, `Mensagem de boas-vindas personalizada!\n\n💬 *Nova mensagem:*\n${newMessage}\n\n🔧 *Variáveis:*\n• @user → menciona novo membro\n• @group → nome do grupo\n\n💡 *Dica:* Use !bv 1 para ativar as boas-vindas`);
            } else {
                await sendError(sock, groupId, 'Erro ao salvar mensagem. Tente novamente.');
            }
            
        } catch (error) {
            console.error('❌ Erro no comando legendabv:', error);
            await sendError(sock, groupId, 'Erro ao executar comando. Tente novamente.');
        }
    }
};