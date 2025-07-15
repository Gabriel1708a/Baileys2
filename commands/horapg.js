const { canExecuteCommand, sendPermissionError, sendSuccess, sendError } = require('../utils/messageUtils');
const { saveConfig, loadConfig } = require('../utils/config');

module.exports = {
    name: 'horapg',
    description: 'Ativa/desativa horários pagantes automáticos',
    usage: '!horapg 1/0',
    examples: ['!horapg 1', '!horapg 0'],
    category: 'Horários Pagantes',
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
                const status = config.horarios ? 'ativado' : 'desativado';
                const interval = config.horariosInterval || 60;
                
                await sock.sendMessage(groupId, { 
                    text: `💰 *HORÁRIOS PAGANTES AUTOMÁTICOS*\n\n📊 *Status atual:* ${status}\n⏰ *Intervalo:* ${interval} minutos\n\n🔧 *Funcionalidade:* Envia horários pagantes automaticamente\n\nUse:\n• !horapg 1 para ativar\n• !horapg 0 para desativar\n• !addhorapg [tempo] para definir intervalo` 
                });
                return;
            }
            
            const option = args[0].trim();
            
            if (option !== '1' && option !== '0') {
                await sendError(sock, groupId, 'Use !horapg 1 para ativar ou !horapg 0 para desativar');
                return;
            }
            
            const activate = option === '1';
            
            // Salvar configuração
            const success = await saveConfig(groupId, 'horarios', activate);
            
            if (success) {
                const status = activate ? 'ativado' : 'desativado';
                const emoji = activate ? '💰' : '❌';
                const interval = await loadConfig(groupId).then(c => c.horariosInterval || 60);
                
                await sendSuccess(sock, groupId, `Horários pagantes automáticos ${status}!\n\n${emoji} *Status:* ${status}\n⏰ *Intervalo:* ${interval} minutos\n\n🔧 *Funcionalidade:* ${activate ? 'Enviará horários pagantes automaticamente' : 'Horários automáticos desativados'}\n\n💡 *Dica:* Use !addhorapg para ajustar o intervalo`);
                
                // Se ativado, iniciar sistema automático
                if (activate) {
                    startHorariosAutomaticos(sock, groupId, interval);
                }
            } else {
                await sendError(sock, groupId, 'Erro ao salvar configuração. Tente novamente.');
            }
            
        } catch (error) {
            console.error('❌ Erro no comando horapg:', error);
            await sendError(sock, groupId, 'Erro ao executar comando. Tente novamente.');
        }
    }
};

function startHorariosAutomaticos(sock, groupId, interval) {
    // Implementar sistema de horários automáticos
    // Por enquanto, apenas log
    console.log(`🕐 Horários automáticos iniciados para ${groupId} com intervalo de ${interval} minutos`);
    
    // TODO: Implementar lógica de envio automático
    // setInterval(async () => {
    //     const config = await loadConfig(groupId);
    //     if (config.horarios) {
    //         await sendHorarioPagante(sock, groupId);
    //     }
    // }, interval * 60 * 1000);
}