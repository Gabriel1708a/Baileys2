const { canExecuteCommand, sendPermissionError, sendSuccess, sendError, validateTimeFormat } = require('../utils/messageUtils');
const { ScheduleManager } = require('../utils/config');

module.exports = {
    name: 'fechargp',
    description: 'Agenda fechamento do grupo',
    usage: '!fechargp HH:MM',
    examples: ['!fechargp 20:00', '!fechargp 23:30'],
    category: 'Controle de Grupo',
    adminOnly: true,
    
    async execute(sock, message, groupId, sender, args) {
        try {
            // Verificar se o usuário é admin
            if (!await canExecuteCommand(sock, groupId, sender)) {
                await sendPermissionError(sock, groupId);
                return;
            }
            
            // Verificar se o horário foi fornecido
            if (args.length === 0) {
                await sendError(sock, groupId, 'Informe o horário!\n\nUso: !fechargp HH:MM\n\nExemplo: !fechargp 20:00');
                return;
            }
            
            const time = args[0].trim();
            
            if (!validateTimeFormat(time)) {
                await sendError(sock, groupId, 'Formato de horário inválido!\n\nUse o formato HH:MM (24h)\n\nExemplo: 20:00, 23:30');
                return;
            }
            
            // Criar agendamento
            const scheduleManager = new ScheduleManager();
            const cron = scheduleManager.timeToCron(time);
            
            // Remover agendamentos anteriores de fechamento
            await removeExistingSchedules(scheduleManager, groupId, 'close');
            
            // Adicionar novo agendamento
            const scheduleId = await scheduleManager.addSchedule(groupId, 'close', cron, { time });
            
            if (scheduleId) {
                await sendSuccess(sock, groupId, `Fechamento do grupo agendado!\n\n⏰ *Horário:* ${time}\n🆔 *ID do agendamento:* ${scheduleId}\n\n🔐 O grupo será fechado automaticamente todos os dias no horário definido.`);
            } else {
                await sendError(sock, groupId, 'Erro ao agendar fechamento. Tente novamente.');
            }
            
        } catch (error) {
            console.error('❌ Erro no comando fechargp:', error);
            await sendError(sock, groupId, 'Erro ao executar comando. Tente novamente.');
        }
    }
};

async function removeExistingSchedules(scheduleManager, groupId, type) {
    try {
        const schedules = await scheduleManager.loadSchedules();
        
        if (schedules[groupId]) {
            const toRemove = schedules[groupId].filter(s => s.type === type);
            
            for (const schedule of toRemove) {
                await scheduleManager.removeSchedule(groupId, schedule.id);
            }
        }
    } catch (error) {
        console.error('❌ Erro ao remover agendamentos existentes:', error);
    }
}