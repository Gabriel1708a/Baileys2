const { getContentType } = require('@whiskeysockets/baileys');

/**
 * Verifica se o usuário é administrador do grupo
 * @param {object} sock - Socket do WhatsApp
 * @param {string} groupId - ID do grupo
 * @param {string} userId - ID do usuário
 * @returns {boolean} Se o usuário é admin
 */
async function isAdmin(sock, groupId, userId) {
    try {
        const groupMetadata = await sock.groupMetadata(groupId);
        const participant = groupMetadata.participants.find(p => p.id === userId);
        return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    } catch (error) {
        console.error('❌ Erro ao verificar admin:', error);
        return false;
    }
}

/**
 * Verifica se a mensagem é de um grupo
 * @param {string} jid - JID da mensagem
 * @returns {boolean} Se é mensagem de grupo
 */
function isGroupMessage(jid) {
    return jid.endsWith('@g.us');
}

/**
 * Extrai o conteúdo da mensagem
 * @param {object} message - Objeto da mensagem
 * @returns {string} Conteúdo da mensagem
 */
function extractMessageContent(message) {
    try {
        const messageType = getContentType(message.message);
        
        switch (messageType) {
            case 'conversation':
                return message.message.conversation;
            
            case 'extendedTextMessage':
                return message.message.extendedTextMessage.text;
            
            case 'imageMessage':
                return message.message.imageMessage.caption || '';
            
            case 'videoMessage':
                return message.message.videoMessage.caption || '';
            
            case 'documentMessage':
                return message.message.documentMessage.caption || '';
            
            case 'audioMessage':
                return ''; // Mensagem de áudio não tem texto
            
            case 'stickerMessage':
                return ''; // Sticker não tem texto
            
            default:
                return '';
        }
    } catch (error) {
        console.error('❌ Erro ao extrair conteúdo da mensagem:', error);
        return '';
    }
}

/**
 * Obtém todos os participantes de um grupo
 * @param {object} sock - Socket do WhatsApp
 * @param {string} groupId - ID do grupo
 * @returns {Array} Lista de participantes
 */
async function getGroupParticipants(sock, groupId) {
    try {
        const groupMetadata = await sock.groupMetadata(groupId);
        return groupMetadata.participants.map(p => p.id);
    } catch (error) {
        console.error('❌ Erro ao obter participantes:', error);
        return [];
    }
}

/**
 * Obtém apenas administradores de um grupo
 * @param {object} sock - Socket do WhatsApp
 * @param {string} groupId - ID do grupo
 * @returns {Array} Lista de administradores
 */
async function getGroupAdmins(sock, groupId) {
    try {
        const groupMetadata = await sock.groupMetadata(groupId);
        return groupMetadata.participants
            .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
            .map(p => p.id);
    } catch (error) {
        console.error('❌ Erro ao obter administradores:', error);
        return [];
    }
}

/**
 * Menciona todos os participantes de um grupo silenciosamente
 * @param {object} sock - Socket do WhatsApp
 * @param {string} groupId - ID do grupo
 * @param {string} message - Mensagem para enviar
 */
async function mentionAll(sock, groupId, message = '📣 Atenção pessoal!') {
    try {
        const participants = await getGroupParticipants(sock, groupId);
        
        if (participants.length === 0) {
            throw new Error('Nenhum participante encontrado');
        }
        
        await sock.sendMessage(groupId, {
            text: message,
            mentions: participants
        });
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao mencionar todos:', error);
        return false;
    }
}

/**
 * Formata tempo em texto legível
 * @param {number} milliseconds - Tempo em milissegundos
 * @returns {string} Tempo formatado
 */
function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days} dia${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
        return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else {
        return `${seconds} segundo${seconds > 1 ? 's' : ''}`;
    }
}

/**
 * Valida formato de horário HH:MM
 * @param {string} time - Horário no formato HH:MM
 * @returns {boolean} Se o formato é válido
 */
function validateTimeFormat(time) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
}

/**
 * Gera ID único para identificar elementos
 * @returns {string} ID único
 */
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Limpa texto removendo caracteres especiais
 * @param {string} text - Texto para limpar
 * @returns {string} Texto limpo
 */
function cleanText(text) {
    if (!text) return '';
    
    return text
        .replace(/[^\w\s\-_.áéíóúâêîôûàèìòùãõç]/gi, '')
        .trim();
}

/**
 * Detecta se mensagem contém comando
 * @param {string} text - Texto da mensagem
 * @returns {object} Informações do comando
 */
function parseCommand(text) {
    if (!text || !text.startsWith('!')) {
        return null;
    }
    
    const parts = text.trim().split(' ');
    const command = parts[0].substring(1).toLowerCase();
    const args = parts.slice(1);
    
    return {
        command,
        args,
        fullText: text,
        argsText: args.join(' ')
    };
}

/**
 * Verifica se usuário pode executar comando (apenas admins)
 * @param {object} sock - Socket do WhatsApp
 * @param {string} groupId - ID do grupo
 * @param {string} userId - ID do usuário
 * @returns {boolean} Se pode executar comando
 */
async function canExecuteCommand(sock, groupId, userId) {
    try {
        return await isAdmin(sock, groupId, userId);
    } catch (error) {
        console.error('❌ Erro ao verificar permissão:', error);
        return false;
    }
}

/**
 * Envia mensagem de erro de permissão
 * @param {object} sock - Socket do WhatsApp
 * @param {string} groupId - ID do grupo
 */
async function sendPermissionError(sock, groupId) {
    try {
        await sock.sendMessage(groupId, {
            text: '❌ Apenas administradores podem usar este comando!'
        });
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem de erro:', error);
    }
}

/**
 * Envia mensagem de sucesso
 * @param {object} sock - Socket do WhatsApp
 * @param {string} groupId - ID do grupo
 * @param {string} message - Mensagem de sucesso
 */
async function sendSuccess(sock, groupId, message) {
    try {
        await sock.sendMessage(groupId, {
            text: `✅ ${message}`
        });
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem de sucesso:', error);
    }
}

/**
 * Envia mensagem de erro
 * @param {object} sock - Socket do WhatsApp
 * @param {string} groupId - ID do grupo
 * @param {string} message - Mensagem de erro
 */
async function sendError(sock, groupId, message) {
    try {
        await sock.sendMessage(groupId, {
            text: `❌ ${message}`
        });
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem de erro:', error);
    }
}

/**
 * Obtém informações sobre mensagem citada
 * @param {object} message - Objeto da mensagem
 * @returns {object|null} Informações da mensagem citada
 */
function getQuotedMessage(message) {
    try {
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMessage) return null;
        
        const quotedId = message.message.extendedTextMessage.contextInfo.stanzaId;
        const quotedSender = message.message.extendedTextMessage.contextInfo.participant;
        
        return {
            id: quotedId,
            sender: quotedSender,
            message: quotedMessage
        };
    } catch (error) {
        console.error('❌ Erro ao obter mensagem citada:', error);
        return null;
    }
}

/**
 * Verifica se a mensagem é uma resposta
 * @param {object} message - Objeto da mensagem
 * @returns {boolean} Se é uma resposta
 */
function isQuotedMessage(message) {
    return !!(message.message?.extendedTextMessage?.contextInfo?.quotedMessage);
}

/**
 * Formata número de telefone
 * @param {string} number - Número de telefone
 * @returns {string} Número formatado
 */
function formatPhoneNumber(number) {
    // Remove todos os caracteres não numéricos
    const cleaned = number.replace(/\D/g, '');
    
    // Adiciona o código do país se não tiver
    if (cleaned.length === 11 && cleaned.startsWith('11')) {
        return `55${cleaned}`;
    } else if (cleaned.length === 10) {
        return `5511${cleaned}`;
    } else if (cleaned.length === 13 && cleaned.startsWith('55')) {
        return cleaned;
    }
    
    return cleaned;
}

module.exports = {
    isAdmin,
    isGroupMessage,
    extractMessageContent,
    getGroupParticipants,
    getGroupAdmins,
    mentionAll,
    formatTime,
    validateTimeFormat,
    generateUniqueId,
    cleanText,
    parseCommand,
    canExecuteCommand,
    sendPermissionError,
    sendSuccess,
    sendError,
    getQuotedMessage,
    isQuotedMessage,
    formatPhoneNumber
};