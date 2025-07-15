const { canExecuteCommand, sendPermissionError, sendSuccess, sendError } = require('../utils/messageUtils');
const { saveConfig, loadConfig } = require('../utils/config');

module.exports = {
    name: 'addhorapg',
    description: 'Define intervalo dos horários pagantes automáticos',
    usage: '!addhorapg [tempo]',
    examples: ['!addhorapg 30m', '!addhorapg 1h', '!addhorapg 2h'],
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
                const currentInterval = config.horariosInterval || 60;
                
                await sock.sendMessage(groupId, { 
                    text: `⏰ *INTERVALO DOS HORÁRIOS PAGANTES*\n\n📊 *Intervalo atual:* ${currentInterval} minutos\n\n🔧 *Uso:* !addhorapg [tempo]\n\n💡 *Exemplos:*\n• !addhorapg 30m (30 minutos)\n• !addhorapg 1h (1 hora)\n• !addhorapg 2h (2 horas)\n\n⚠️ *Formatos aceitos:* m (minutos), h (horas)` 
                });
                return;
            }
            
            const timeStr = args[0].trim();
            
            // Validar formato
            const timeRegex = /^(\d+)([mh])$/;
            const match = timeStr.match(timeRegex);
            
            if (!match) {
                await sendError(sock, groupId, 'Formato inválido!\n\nUse: m (minutos) ou h (horas)\n\nExemplos: 30m, 1h, 2h');
                return;
            }
            
            const value = parseInt(match[1]);
            const unit = match[2];
            
            // Converter para minutos
            let intervalMinutes;
            switch (unit) {
                case 'm':
                    intervalMinutes = value;
                    break;
                case 'h':
                    intervalMinutes = value * 60;
                    break;
                default:
                    intervalMinutes = 60;
            }
            
            // Validar limites
            if (intervalMinutes < 10) {
                await sendError(sock, groupId, 'Intervalo mínimo: 10 minutos');
                return;
            }
            
            if (intervalMinutes > 1440) { // 24 horas
                await sendError(sock, groupId, 'Intervalo máximo: 24 horas');
                return;
            }
            
            // Salvar configuração
            const success = await saveConfig(groupId, 'horariosInterval', intervalMinutes);
            
            if (success) {
                const displayTime = intervalMinutes >= 60 ? 
                    `${Math.floor(intervalMinutes / 60)}h ${intervalMinutes % 60}m` : 
                    `${intervalMinutes}m`;
                
                await sendSuccess(sock, groupId, `Intervalo dos horários pagantes atualizado!\n\n⏰ *Novo intervalo:* ${displayTime}\n📊 *Em minutos:* ${intervalMinutes}\n\n💡 *Dica:* Use !horapg 1 para ativar os horários automáticos`);
            } else {
                await sendError(sock, groupId, 'Erro ao salvar configuração. Tente novamente.');
            }
            
        } catch (error) {
            console.error('❌ Erro no comando addhorapg:', error);
            await sendError(sock, groupId, 'Erro ao executar comando. Tente novamente.');
        }
    }
};