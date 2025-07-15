const { canExecuteCommand, sendPermissionError, sendError } = require('../utils/messageUtils');
const { loadConfig } = require('../utils/config');
const moment = require('moment-timezone');

module.exports = {
    name: 'horarios',
    description: 'Envia horário pagante atual',
    usage: '!horarios',
    category: 'Horários Pagantes',
    adminOnly: true,
    
    async execute(sock, message, groupId, sender, args) {
        try {
            // Verificar se o usuário é admin
            if (!await canExecuteCommand(sock, groupId, sender)) {
                await sendPermissionError(sock, groupId);
                return;
            }
            
            const config = await loadConfig(groupId);
            
            if (!config.active) {
                await sendError(sock, groupId, 'Grupo não está ativo para horários pagantes!');
                return;
            }
            
            const now = moment().tz('America/Sao_Paulo');
            const horario = now.format('HH:mm');
            const data = now.format('DD/MM/YYYY');
            
            // Gerar múltiplos horários pagantes
            const horarios = generateHorariosPagantes(now);
            
            const message_text = `💰 *HORÁRIOS PAGANTES* 🍀

📅 *Data:* ${data}
🕐 *Horário atual:* ${horario}

🎰 *HORÁRIOS RECOMENDADOS:*
${horarios.map(h => `🕐 ${h.time} - ${h.description}`).join('\n')}

💡 *Dicas:*
• Jogue com responsabilidade
• Defina limites de apostas
• Pare quando atingir o lucro desejado

⚠️ *Aviso:* Apostas envolvem riscos. Jogue apenas o que pode perder.

🍀 *Boa sorte!*`;
            
            await sock.sendMessage(groupId, { text: message_text });
            
        } catch (error) {
            console.error('❌ Erro no comando horarios:', error);
            await sendError(sock, groupId, 'Erro ao executar comando. Tente novamente.');
        }
    }
};

function generateHorariosPagantes(now) {
    const horarios = [];
    
    // Gerar horários com base no momento atual
    const baseMinute = now.minute();
    const baseHour = now.hour();
    
    // Horários recomendados com base em padrões
    const patterns = [
        { offset: 5, desc: 'Entrada rápida' },
        { offset: 15, desc: 'Horário clássico' },
        { offset: 30, desc: 'Meio período' },
        { offset: 45, desc: 'Três quartos' },
        { offset: 60, desc: 'Próxima hora' }
    ];
    
    for (const pattern of patterns) {
        const targetTime = now.clone().add(pattern.offset, 'minutes');
        
        horarios.push({
            time: targetTime.format('HH:mm'),
            description: pattern.desc
        });
    }
    
    return horarios;
}