const { canExecuteCommand, sendPermissionError, formatTime } = require('../utils/messageUtils');
const { AdsManager } = require('../utils/config');

module.exports = {
    name: 'listads',
    description: 'Lista anúncios automáticos ativos',
    usage: '!listads',
    category: 'Anúncios',
    adminOnly: true,
    
    async execute(sock, message, groupId, sender, args) {
        try {
            // Verificar se o usuário é admin
            if (!await canExecuteCommand(sock, groupId, sender)) {
                await sendPermissionError(sock, groupId);
                return;
            }
            
            const adsManager = new AdsManager();
            const ads = await adsManager.getGroupAds(groupId);
            
            if (ads.length === 0) {
                await sock.sendMessage(groupId, { 
                    text: '📌 Nenhum anúncio ativo encontrado.\n\nUse !addads para criar um anúncio.' 
                });
                return;
            }
            
            let listText = '📌 *ANÚNCIOS ATIVOS*\n\n';
            
            for (const ad of ads) {
                if (ad.active) {
                    const intervalText = formatTime(ad.interval);
                    const createdDate = new Date(ad.created).toLocaleDateString('pt-BR');
                    
                    listText += `🗞️ *ID:* ${ad.id}\n`;
                    listText += `💬 *Mensagem:* ${ad.message}\n`;
                    listText += `⏰ *Intervalo:* ${intervalText}\n`;
                    listText += `📅 *Criado em:* ${createdDate}\n`;
                    listText += `📊 *Status:* ${ad.active ? '✅ Ativo' : '❌ Inativo'}\n\n`;
                    listText += '═══════════════════════\n\n';
                }
            }
            
            if (listText === '📌 *ANÚNCIOS ATIVOS*\n\n') {
                listText = '📌 Nenhum anúncio ativo encontrado.\n\nUse !addads para criar um anúncio.';
            } else {
                listText += '💡 *Dica:* Use !rmads [ID] para remover um anúncio';
            }
            
            await sock.sendMessage(groupId, { text: listText });
            
        } catch (error) {
            console.error('❌ Erro no comando listads:', error);
            await sock.sendMessage(groupId, { 
                text: '❌ Erro ao listar anúncios. Tente novamente.' 
            });
        }
    }
};