const { canExecuteCommand, sendPermissionError, sendError, formatTime } = require('../utils/messageUtils');
const moment = require('moment-timezone');

module.exports = {
    name: 'sorteio',
    description: 'Cria sorteio com reações',
    usage: '!sorteio prêmio|tempo',
    examples: ['!sorteio 100 reais|2m', '!sorteio iPhone 15|5m'],
    category: 'Sorteios',
    adminOnly: true,
    
    async execute(sock, message, groupId, sender, args) {
        try {
            // Verificar se o usuário é admin
            if (!await canExecuteCommand(sock, groupId, sender)) {
                await sendPermissionError(sock, groupId);
                return;
            }
            
            // Verificar se os argumentos foram fornecidos
            if (args.length === 0) {
                await sendError(sock, groupId, 'Uso correto: !sorteio prêmio|tempo\n\nExemplo: !sorteio 100 reais|2m');
                return;
            }
            
            const fullText = args.join(' ');
            const parts = fullText.split('|');
            
            if (parts.length !== 2) {
                await sendError(sock, groupId, 'Formato incorreto! Use: prêmio|tempo\n\nExemplo: !sorteio 100 reais|2m');
                return;
            }
            
            const premio = parts[0].trim();
            const tempoStr = parts[1].trim();
            
            if (!premio || !tempoStr) {
                await sendError(sock, groupId, 'Prêmio e tempo são obrigatórios!');
                return;
            }
            
            // Converter tempo para milissegundos
            const tempoMs = parseTimeToMs(tempoStr);
            
            if (tempoMs === null) {
                await sendError(sock, groupId, 'Formato de tempo inválido!\n\nUse: s (segundos), m (minutos), h (horas)\nExemplo: 30s, 2m, 1h');
                return;
            }
            
            if (tempoMs < 10000) { // Mínimo 10 segundos
                await sendError(sock, groupId, 'Tempo mínimo é de 10 segundos!');
                return;
            }
            
            if (tempoMs > 86400000) { // Máximo 24 horas
                await sendError(sock, groupId, 'Tempo máximo é de 24 horas!');
                return;
            }
            
            // Criar mensagem do sorteio
            const tempoFormatado = formatTime(tempoMs);
            const now = moment().tz('America/Sao_Paulo');
            const endTime = now.clone().add(tempoMs, 'milliseconds');
            
            const sorteioMessage = `🎉 *SORTEIO INICIADO!* 🎉

🏆 *Prêmio:* ${premio}
⏰ *Tempo:* ${tempoFormatado}
🕐 *Término:* ${endTime.format('HH:mm:ss')}

✅ *Reaja com ✅ para participar!*

📊 *Participantes:* 0
👤 *Criado por:* @${sender.split('@')[0]}`;
            
            // Enviar mensagem
            const sentMessage = await sock.sendMessage(groupId, { 
                text: sorteioMessage,
                mentions: [sender]
            });
            
            // Aguardar o tempo do sorteio
            setTimeout(async () => {
                await finalizarSorteio(sock, groupId, sentMessage.key.id, premio);
            }, tempoMs);
            
        } catch (error) {
            console.error('❌ Erro no comando sorteio:', error);
            await sendError(sock, groupId, 'Erro ao executar comando. Tente novamente.');
        }
    }
};

function parseTimeToMs(timeStr) {
    const match = timeStr.match(/^(\d+)([smh])$/);
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        default: return null;
    }
}

async function finalizarSorteio(sock, groupId, messageId, premio) {
    try {
        // Obter reações da mensagem
        const reactions = await getMessageReactions(sock, groupId, messageId);
        const participants = reactions.filter(r => r.reaction === '✅').map(r => r.user);
        
        if (participants.length === 0) {
            await sock.sendMessage(groupId, { 
                text: '🎉 *SORTEIO FINALIZADO!* 🎉\n\n❌ Nenhum participante encontrado.\n\n🏆 *Prêmio:* ' + premio 
            });
            return;
        }
        
        // Sortear vencedor
        const winner = participants[Math.floor(Math.random() * participants.length)];
        
        const resultMessage = `🎉 *SORTEIO FINALIZADO!* 🎉

🏆 *Prêmio:* ${premio}
🥳 *Vencedor:* @${winner.split('@')[0]}
📊 *Total de participantes:* ${participants.length}

🎊 *Parabéns ao vencedor!*`;
        
        await sock.sendMessage(groupId, { 
            text: resultMessage,
            mentions: [winner]
        });
        
    } catch (error) {
        console.error('❌ Erro ao finalizar sorteio:', error);
        await sock.sendMessage(groupId, { 
            text: '❌ Erro ao finalizar sorteio. Não foi possível determinar o vencedor.' 
        });
    }
}

async function getMessageReactions(sock, groupId, messageId) {
    try {
        // Nota: Esta função é uma simulação, pois o Baileys não tem suporte nativo para reações
        // Em uma implementação real, você precisaria armazenar as reações manualmente
        // ou usar uma biblioteca adicional que suporte reações
        
        // Por enquanto, retornamos um array vazio
        return [];
    } catch (error) {
        console.error('❌ Erro ao obter reações:', error);
        return [];
    }
}