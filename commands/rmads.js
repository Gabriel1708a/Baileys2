const { canExecuteCommand, sendPermissionError, sendSuccess, sendError } = require('../utils/messageUtils');
const { AdsManager } = require('../utils/config');

module.exports = {
    name: 'rmads',
    description: 'Remove anúncio automático',
    usage: '!rmads [ID]',
    examples: ['!rmads 1672531200000'],
    category: 'Anúncios',
    adminOnly: true,
    
    async execute(sock, message, groupId, sender, args) {
        try {
            // Verificar se o usuário é admin
            if (!await canExecuteCommand(sock, groupId, sender)) {
                await sendPermissionError(sock, groupId);
                return;
            }
            
            // Verificar se o ID foi fornecido
            if (args.length === 0) {
                await sendError(sock, groupId, 'Informe o ID do anúncio!\n\nUso: !rmads [ID]\n\nUse !listads para ver os IDs disponíveis.');
                return;
            }
            
            const adId = args[0].trim();
            
            if (!adId) {
                await sendError(sock, groupId, 'ID do anúncio é obrigatório!');
                return;
            }
            
            // Verificar se o anúncio existe
            const adsManager = new AdsManager();
            const ads = await adsManager.getGroupAds(groupId);
            const existingAd = ads.find(ad => ad.id === adId);
            
            if (!existingAd) {
                await sendError(sock, groupId, `Anúncio com ID ${adId} não encontrado!\n\nUse !listads para ver os IDs disponíveis.`);
                return;
            }
            
            // Remover o anúncio
            const success = await adsManager.removeAd(groupId, adId);
            
            if (success) {
                // Parar o intervalo do anúncio
                const intervalKey = `${groupId}-${adId}`;
                if (global.botInstance?.intervalos.has(intervalKey)) {
                    clearInterval(global.botInstance.intervalos.get(intervalKey));
                    global.botInstance.intervalos.delete(intervalKey);
                }
                
                await sendSuccess(sock, groupId, `Anúncio removido com sucesso!\n\n🗑️ *ID:* ${adId}\n💬 *Mensagem:* ${existingAd.message}`);
            } else {
                await sendError(sock, groupId, 'Erro ao remover anúncio. Tente novamente.');
            }
            
        } catch (error) {
            console.error('❌ Erro no comando rmads:', error);
            await sendError(sock, groupId, 'Erro ao executar comando. Tente novamente.');
        }
    }
};