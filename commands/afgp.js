const { canExecuteCommand, sendPermissionError, sendSuccess, sendError } = require('../utils/messageUtils');
const { ScheduleManager } = require('../utils/config');

module.exports = {
    name: 'afgp',
    description: 'Cancela agendamentos de grupo',
    usage: '!afgp 0',
    examples: ['!afgp 0'],
    category: 'Controle de Grupo',
    adminOnly: true,
    
    async execute(sock, message, groupId, sender, args) {
        try {
            // Verificar se o usuário é admin
            if (!await canExecuteCommand(sock, groupId, sender)) {
                await sendPermissionError(sock, groupId);
                return;
            }
            
            // Verificar se o argumento foi fornecido
            if (args.length === 0 || args[0] !== '0') {
                await sendError(sock, groupId, 'Use: !afgp 0 para cancelar todos os agendamentos');
                return;
            }
            
            const scheduleManager = new ScheduleManager();
            const schedules = await scheduleManager.loadSchedules();
            
            if (!schedules[groupId] || schedules[groupId].length === 0) {
                await sock.sendMessage(groupId, { 
                    text: '📅 Nenhum agendamento encontrado para este grupo.' 
                });
                return;
            }
            
            // Contar agendamentos ativos
            const activeSchedules = schedules[groupId].filter(s => s.active);
            
            if (activeSchedules.length === 0) {
                await sock.sendMessage(groupId, { 
                    text: '📅 Nenhum agendamento ativo encontrado.' 
                });
                return;
            }
            
            // Remover todos os agendamentos do grupo
            const toRemove = [...schedules[groupId]];
            
            for (const schedule of toRemove) {
                await scheduleManager.removeSchedule(groupId, schedule.id);
            }
            
            await sendSuccess(sock, groupId, `Agendamentos cancelados!\n\n🗓️ *Total removido:* ${activeSchedules.length}\n\n✅ Todos os agendamentos de abertura e fechamento foram cancelados.`);
            
        } catch (error) {
            console.error('❌ Erro no comando afgp:', error);
            await sendError(sock, groupId, 'Erro ao executar comando. Tente novamente.');
        }
    }
};