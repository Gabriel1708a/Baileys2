const { 
    default: makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    jidDecode,
    proto,
    getContentType
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const moment = require('moment-timezone');
const fs = require('fs-extra');
const path = require('path');

// Importar utilitários
const { saveConfig, loadConfig, getGroupInfo } = require('./utils/config');
const { loadCommands } = require('./utils/commandLoader');
const { isAdmin, isGroupMessage, extractMessageContent } = require('./utils/messageUtils');

// Configurações
const SESSION_DIR = './sessions';
const TIMEZONE = 'America/Sao_Paulo';
const PAIRING_CODE_TIMEOUT = 60000; // 1 minuto

class WhatsAppBot {
    constructor() {
        this.sock = null;
        this.store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
        this.commands = {};
        this.intervalos = new Map(); // Para anúncios automáticos
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Iniciando Bot WhatsApp...');
            
            // Carregar comandos
            this.commands = await loadCommands();
            console.log(`📝 ${Object.keys(this.commands).length} comandos carregados`);
            
            // Conectar ao WhatsApp
            await this.connectToWhatsApp();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar bot:', error);
            setTimeout(() => this.init(), 5000);
        }
    }

    async connectToWhatsApp() {
        try {
            // Verificar se o diretório de sessão existe
            await fs.ensureDir(SESSION_DIR);
            
            // Configurar autenticação
            const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
            
            // Obter versão mais recente do Baileys
            const { version, isLatest } = await fetchLatestBaileysVersion();
            console.log(`📱 Usando WhatsApp v${version.join('.')}, isLatest: ${isLatest}`);
            
            // Criar socket
            this.sock = makeWASocket({
                version,
                logger: pino({ level: 'silent' }),
                printQRInTerminal: false, // Evitar QR Code
                auth: state,
                browser: ['Bot Admin WhatsApp', 'Chrome', '10.0.0'],
                defaultQueryTimeoutMs: 60000,
                generateHighQualityLinkPreview: true,
                syncFullHistory: false,
                markOnlineOnConnect: true,
                getMessage: async (key) => {
                    return {
                        conversation: "Mensagem não encontrada"
                    };
                }
            });
            
            // Configurar store
            this.store.bind(this.sock.ev);
            
            // Event handlers
            this.sock.ev.on('creds.update', saveCreds);
            this.sock.ev.on('connection.update', (update) => this.handleConnectionUpdate(update));
            this.sock.ev.on('messages.upsert', (m) => this.handleMessages(m));
            this.sock.ev.on('group-participants.update', (update) => this.handleGroupParticipants(update));
            
        } catch (error) {
            console.error('❌ Erro ao conectar:', error);
            setTimeout(() => this.connectToWhatsApp(), 5000);
        }
    }

    async handleConnectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update;
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('🔌 Conexão fechada devido a:', lastDisconnect?.error, ', reconectando:', shouldReconnect);
            
            if (shouldReconnect) {
                setTimeout(() => this.connectToWhatsApp(), 3000);
            }
        } else if (connection === 'open') {
            console.log('✅ Conectado ao WhatsApp!');
            
            // Obter informações do bot
            const botInfo = this.sock.user;
            console.log(`📱 Bot conectado como: ${botInfo.name} (${botInfo.id})`);
            
            // Carregar configurações de grupos
            await this.loadGroupConfigs();
            
            // Iniciar sistemas automáticos
            this.startAutomaticSystems();
            
        } else if (qr) {
            console.log('📱 QR Code gerado - mas preferimos código de pareamento');
        }
        
        // Solicitar código de pareamento se não estiver conectado
        if (!this.sock.user && !qr) {
            await this.requestPairingCode();
        }
    }

    async requestPairingCode() {
        try {
            const phoneNumber = process.env.BOT_PHONE || await this.getPhoneNumber();
            
            if (phoneNumber) {
                console.log(`📞 Solicitando código de pareamento para: ${phoneNumber}`);
                
                const code = await this.sock.requestPairingCode(phoneNumber);
                console.log(`🔐 Código de pareamento gerado: ${code}`);
                console.log('📱 Envie este código para o número do bot no WhatsApp');
                
                // Aguardar timeout
                setTimeout(() => {
                    if (!this.sock.user) {
                        console.log('⏰ Timeout do código de pareamento. Tentando novamente...');
                        this.requestPairingCode();
                    }
                }, PAIRING_CODE_TIMEOUT);
            }
        } catch (error) {
            console.error('❌ Erro ao solicitar código de pareamento:', error);
            setTimeout(() => this.requestPairingCode(), 5000);
        }
    }

    async getPhoneNumber() {
        // Verificar se há número salvo
        const configPath = './config/bot.json';
        
        if (await fs.pathExists(configPath)) {
            const config = await fs.readJSON(configPath);
            if (config.phoneNumber) {
                return config.phoneNumber;
            }
        }
        
        // Solicitar número via console (para primeira configuração)
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        return new Promise((resolve) => {
            rl.question('📱 Digite o número do bot (formato: 5511999999999): ', async (answer) => {
                const phoneNumber = answer.trim();
                
                // Salvar número para uso futuro
                await fs.ensureDir('./config');
                await fs.writeJSON(configPath, { phoneNumber }, { spaces: 2 });
                
                rl.close();
                resolve(phoneNumber);
            });
        });
    }

    async handleMessages(m) {
        try {
            const message = m.messages[0];
            if (!message.message) return;
            
            const messageContent = extractMessageContent(message);
            if (!messageContent) return;
            
            const from = message.key.remoteJid;
            const isGroup = isGroupMessage(from);
            
            // Processar apenas mensagens de grupos
            if (!isGroup) return;
            
            const sender = message.key.participant || message.key.remoteJid;
            const text = messageContent.toLowerCase().trim();
            
            // Verificar se é um comando
            if (text.startsWith('!')) {
                await this.processCommand(text, message, from, sender);
            }
            
            // Verificar sistemas automáticos
            await this.checkAutomaticSystems(message, from, sender, messageContent);
            
        } catch (error) {
            console.error('❌ Erro ao processar mensagem:', error);
        }
    }

    async processCommand(text, message, groupId, sender) {
        const parts = text.split(' ');
        const command = parts[0].substring(1); // Remove o !
        
        if (this.commands[command]) {
            try {
                await this.commands[command](this.sock, message, groupId, sender, parts.slice(1));
            } catch (error) {
                console.error(`❌ Erro ao executar comando ${command}:`, error);
                await this.sock.sendMessage(groupId, { 
                    text: `❌ Erro ao executar comando. Tente novamente.` 
                });
            }
        }
    }

    async checkAutomaticSystems(message, groupId, sender, messageContent) {
        const config = await loadConfig(groupId);
        
        // Verificar anti-link
        if (config.antilink || config.antilinkgp || config.banextremo || config.banlinkgp) {
            const linkDetection = this.detectLinks(messageContent);
            if (linkDetection.hasAnyLink || linkDetection.hasWhatsAppLink) {
                await this.handleLinkDetection(groupId, sender, message, messageContent, config);
            }
        }
    }

    detectLinks(text) {
        const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/gi;
        const whatsappGroupRegex = /chat\.whatsapp\.com\/[^\s]+/gi;
        
        return {
            hasAnyLink: linkRegex.test(text),
            hasWhatsAppLink: whatsappGroupRegex.test(text)
        };
    }

    async handleLinkDetection(groupId, sender, message, messageContent, config) {
        const { hasAnyLink, hasWhatsAppLink } = this.detectLinks(messageContent);
        
        // Verificar se o usuário é admin
        const isUserAdmin = await isAdmin(this.sock, groupId, sender);
        if (isUserAdmin) return; // Admins podem enviar links
        
        // Processar baseado na configuração
        if (config.banextremo && hasAnyLink) {
            await this.deleteMessage(groupId, message.key);
            await this.banUser(groupId, sender);
            await this.sock.sendMessage(groupId, { 
                text: `🚫 Usuário banido por envio de link!` 
            });
        } else if (config.banlinkgp && hasWhatsAppLink) {
            await this.deleteMessage(groupId, message.key);
            await this.banUser(groupId, sender);
            await this.sock.sendMessage(groupId, { 
                text: `🚫 Usuário banido por envio de link de grupo!` 
            });
        } else if (config.antilink && hasAnyLink) {
            await this.deleteMessage(groupId, message.key);
            await this.sock.sendMessage(groupId, { 
                text: `⚠️ Links não são permitidos neste grupo!` 
            });
        } else if (config.antilinkgp && hasWhatsAppLink) {
            await this.deleteMessage(groupId, message.key);
            await this.sock.sendMessage(groupId, { 
                text: `⚠️ Links de grupos não são permitidos!` 
            });
        }
    }

    async deleteMessage(groupId, messageKey) {
        try {
            await this.sock.sendMessage(groupId, { delete: messageKey });
        } catch (error) {
            console.error('❌ Erro ao deletar mensagem:', error);
        }
    }

    async banUser(groupId, userId) {
        try {
            await this.sock.groupParticipantsUpdate(groupId, [userId], 'remove');
        } catch (error) {
            console.error('❌ Erro ao banir usuário:', error);
        }
    }

    async handleGroupParticipants(update) {
        const { id: groupId, participants, action } = update;
        
        if (action === 'add') {
            const config = await loadConfig(groupId);
            
            if (config.welcome) {
                await this.sendWelcomeMessage(groupId, participants, config);
            }
        }
    }

    async sendWelcomeMessage(groupId, participants, config) {
        try {
            const groupInfo = await getGroupInfo(this.sock, groupId);
            const welcomeMessage = config.welcomeMessage || 'Bem-vindo(a) ao grupo @group, @user! 🎉';
            
            for (const participant of participants) {
                const message = welcomeMessage
                    .replace('@user', `@${participant.split('@')[0]}`)
                    .replace('@group', groupInfo.subject || 'grupo');
                
                await this.sock.sendMessage(groupId, {
                    text: message,
                    mentions: [participant]
                });
            }
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem de boas-vindas:', error);
        }
    }

    async loadGroupConfigs() {
        console.log('📋 Carregando configurações dos grupos...');
        
        // Carregar anúncios automáticos
        await this.loadAutoAds();
        
        // Carregar horários programados
        await this.loadScheduledTasks();
        
        console.log('✅ Configurações carregadas!');
    }

    async loadAutoAds() {
        const adsPath = './data/ads.json';
        
        if (await fs.pathExists(adsPath)) {
            const ads = await fs.readJSON(adsPath);
            
            for (const [groupId, groupAds] of Object.entries(ads)) {
                for (const ad of groupAds) {
                    if (ad.active) {
                        this.startAdInterval(groupId, ad);
                    }
                }
            }
        }
    }

    startAdInterval(groupId, ad) {
        const interval = setInterval(async () => {
            try {
                await this.sock.sendMessage(groupId, { text: ad.message });
            } catch (error) {
                console.error('❌ Erro ao enviar anúncio:', error);
                clearInterval(interval);
            }
        }, ad.interval);
        
        this.intervalos.set(`${groupId}-${ad.id}`, interval);
    }

    async loadScheduledTasks() {
        const cron = require('node-cron');
        const schedulePath = './data/schedule.json';
        
        if (await fs.pathExists(schedulePath)) {
            const schedules = await fs.readJSON(schedulePath);
            
            for (const [groupId, tasks] of Object.entries(schedules)) {
                for (const task of tasks) {
                    if (task.active) {
                        cron.schedule(task.cron, async () => {
                            await this.executeScheduledTask(groupId, task);
                        }, {
                            timezone: TIMEZONE
                        });
                    }
                }
            }
        }
    }

    async executeScheduledTask(groupId, task) {
        try {
            switch (task.type) {
                case 'open':
                    await this.sock.groupSettingUpdate(groupId, 'not_announcement');
                    await this.sock.sendMessage(groupId, { text: '🔓 Grupo aberto!' });
                    break;
                
                case 'close':
                    await this.sock.groupSettingUpdate(groupId, 'announcement');
                    await this.sock.sendMessage(groupId, { text: '🔐 Grupo fechado!' });
                    break;
                
                case 'horario':
                    await this.sendHorarioPagante(groupId);
                    break;
            }
        } catch (error) {
            console.error('❌ Erro ao executar tarefa agendada:', error);
        }
    }

    async sendHorarioPagante(groupId) {
        const now = moment().tz(TIMEZONE);
        const horario = now.format('HH:mm');
        
        const message = `💰 HORÁRIO PAGANTE! 🍀\n\n🕐 Horário: ${horario}\n🎰 Boa sorte nas apostas!\n\n⚠️ Jogue com responsabilidade`;
        
        await this.sock.sendMessage(groupId, { text: message });
    }

    startAutomaticSystems() {
        console.log('🔄 Sistemas automáticos iniciados!');
        
        // Verificar reconexão a cada 30 segundos
        setInterval(() => {
            if (!this.sock.user) {
                console.log('🔄 Reconectando...');
                this.connectToWhatsApp();
            }
        }, 30000);
    }
}

// Iniciar bot
const bot = new WhatsAppBot();

// Tornar bot disponível globalmente para comandos
global.botInstance = bot;

// Capturar sinais de encerramento
process.on('SIGINT', () => {
    console.log('🛑 Encerrando bot...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Encerrando bot...');
    process.exit(0);
});