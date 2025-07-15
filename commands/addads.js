const { canExecuteCommand, sendPermissionError, sendSuccess, sendError } = require('../utils/messageUtils');
const { AdsManager } = require('../utils/config');

module.exports = {
    name: 'addads',
    description: 'Adiciona anúncio automático',
    usage: '!addads mensagem|intervalo',
    examples: ['!addads Boa noite!|30m', '!addads Promoção especial!|1h'],
    category: 'Anúncios',
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
                await sendError(sock, groupId, 'Uso correto: !addads mensagem|intervalo\n\nExemplo: !addads Boa noite!|30m');
                return;
            }
            
            const fullText = args.join(' ');
            const parts = fullText.split('|');
            
            if (parts.length !== 2) {
                await sendError(sock, groupId, 'Formato incorreto! Use: mensagem|intervalo\n\nExemplo: !addads Boa noite!|30m');
                return;
            }
            
            const adMessage = parts[0].trim();
            const interval = parts[1].trim();
            
            if (!adMessage || !interval) {
                await sendError(sock, groupId, 'Mensagem e intervalo são obrigatórios!');
                return;
            }
            
            // Validar formato do intervalo
            const validIntervalRegex = /^(\d+)([smhd])$/;
            if (!validIntervalRegex.test(interval)) {
                await sendError(sock, groupId, 'Formato de intervalo inválido!\n\nUse: s (segundos), m (minutos), h (horas), d (dias)\nExemplo: 30m, 1h, 2d');
                return;
            }
            
            // Criar anúncio
            const adsManager = new AdsManager();
            const adId = await adsManager.addAd(groupId, adMessage, interval);
            
            if (adId) {
                await sendSuccess(sock, groupId, `Anúncio criado com sucesso!\n\n🗞️ *Mensagem:* ${adMessage}\n⏰ *Intervalo:* ${interval}\n🆔 *ID:* ${adId}`);
                
                // Iniciar o intervalo do anúncio
                global.botInstance?.startAdInterval(groupId, {
                    id: adId,
                    message: adMessage,
                    interval: adsManager.parseInterval(interval),
                    active: true
                });
            } else {
                await sendError(sock, groupId, 'Erro ao criar anúncio. Tente novamente.');
            }
            
        } catch (error) {
            console.error('❌ Erro no comando addads:', error);
            await sendError(sock, groupId, 'Erro ao executar comando. Tente novamente.');
        }
    }
};