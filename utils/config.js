const fs = require('fs-extra');
const path = require('path');

// Diretório para armazenar configurações
const CONFIG_DIR = './data';
const GROUPS_CONFIG_FILE = path.join(CONFIG_DIR, 'groups.json');

/**
 * Carrega configurações de um grupo específico
 * @param {string} groupId - ID do grupo
 * @returns {object} Configurações do grupo
 */
async function loadConfig(groupId) {
    try {
        await fs.ensureDir(CONFIG_DIR);
        
        if (await fs.pathExists(GROUPS_CONFIG_FILE)) {
            const allConfigs = await fs.readJSON(GROUPS_CONFIG_FILE);
            return allConfigs[groupId] || getDefaultConfig();
        }
        
        return getDefaultConfig();
    } catch (error) {
        console.error('❌ Erro ao carregar configuração:', error);
        return getDefaultConfig();
    }
}

/**
 * Salva configuração específica de um grupo
 * @param {string} groupId - ID do grupo
 * @param {string} key - Chave da configuração
 * @param {any} value - Valor da configuração
 */
async function saveConfig(groupId, key, value) {
    try {
        await fs.ensureDir(CONFIG_DIR);
        
        let allConfigs = {};
        if (await fs.pathExists(GROUPS_CONFIG_FILE)) {
            allConfigs = await fs.readJSON(GROUPS_CONFIG_FILE);
        }
        
        if (!allConfigs[groupId]) {
            allConfigs[groupId] = getDefaultConfig();
        }
        
        allConfigs[groupId][key] = value;
        
        await fs.writeJSON(GROUPS_CONFIG_FILE, allConfigs, { spaces: 2 });
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar configuração:', error);
        return false;
    }
}

/**
 * Salva configuração completa de um grupo
 * @param {string} groupId - ID do grupo
 * @param {object} config - Configuração completa
 */
async function saveGroupConfig(groupId, config) {
    try {
        await fs.ensureDir(CONFIG_DIR);
        
        let allConfigs = {};
        if (await fs.pathExists(GROUPS_CONFIG_FILE)) {
            allConfigs = await fs.readJSON(GROUPS_CONFIG_FILE);
        }
        
        allConfigs[groupId] = { ...getDefaultConfig(), ...config };
        
        await fs.writeJSON(GROUPS_CONFIG_FILE, allConfigs, { spaces: 2 });
        
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar configuração do grupo:', error);
        return false;
    }
}

/**
 * Obtém configuração padrão para um grupo
 * @returns {object} Configuração padrão
 */
function getDefaultConfig() {
    return {
        // Sistema de boas-vindas
        welcome: false,
        welcomeMessage: 'Bem-vindo(a) ao grupo @group, @user! 🎉',
        
        // Sistema anti-link
        antilink: false,
        antilinkgp: false,
        banlink: false,
        banlinkgp: false,
        banextremo: false,
        
        // Sistema de horários
        horarios: false,
        horariosInterval: 60, // minutos
        
        // Status do grupo
        active: true,
        
        // Configurações administrativas
        admins: [],
        
        // Última atividade
        lastActivity: new Date().toISOString()
    };
}

/**
 * Obtém informações de um grupo
 * @param {object} sock - Socket do WhatsApp
 * @param {string} groupId - ID do grupo
 * @returns {object} Informações do grupo
 */
async function getGroupInfo(sock, groupId) {
    try {
        const groupMetadata = await sock.groupMetadata(groupId);
        return {
            id: groupId,
            subject: groupMetadata.subject,
            description: groupMetadata.desc,
            participants: groupMetadata.participants,
            admins: groupMetadata.participants.filter(p => p.admin).map(p => p.id),
            owner: groupMetadata.owner,
            creation: groupMetadata.creation,
            size: groupMetadata.size
        };
    } catch (error) {
        console.error('❌ Erro ao obter informações do grupo:', error);
        return {
            id: groupId,
            subject: 'Grupo',
            description: '',
            participants: [],
            admins: [],
            owner: null,
            creation: Date.now(),
            size: 0
        };
    }
}

/**
 * Verifica se o grupo está ativo
 * @param {string} groupId - ID do grupo
 * @returns {boolean} Status do grupo
 */
async function isGroupActive(groupId) {
    try {
        const config = await loadConfig(groupId);
        return config.active;
    } catch (error) {
        console.error('❌ Erro ao verificar status do grupo:', error);
        return false;
    }
}

/**
 * Atualiza última atividade do grupo
 * @param {string} groupId - ID do grupo
 */
async function updateLastActivity(groupId) {
    try {
        await saveConfig(groupId, 'lastActivity', new Date().toISOString());
    } catch (error) {
        console.error('❌ Erro ao atualizar última atividade:', error);
    }
}

/**
 * Gerencia dados de anúncios automáticos
 */
class AdsManager {
    constructor() {
        this.adsFile = path.join(CONFIG_DIR, 'ads.json');
    }
    
    async loadAds() {
        try {
            await fs.ensureDir(CONFIG_DIR);
            
            if (await fs.pathExists(this.adsFile)) {
                return await fs.readJSON(this.adsFile);
            }
            
            return {};
        } catch (error) {
            console.error('❌ Erro ao carregar anúncios:', error);
            return {};
        }
    }
    
    async saveAds(ads) {
        try {
            await fs.ensureDir(CONFIG_DIR);
            await fs.writeJSON(this.adsFile, ads, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar anúncios:', error);
            return false;
        }
    }
    
    async addAd(groupId, message, interval) {
        try {
            const ads = await this.loadAds();
            
            if (!ads[groupId]) {
                ads[groupId] = [];
            }
            
            const id = Date.now().toString();
            const ad = {
                id,
                message,
                interval: this.parseInterval(interval),
                active: true,
                created: new Date().toISOString()
            };
            
            ads[groupId].push(ad);
            await this.saveAds(ads);
            
            return id;
        } catch (error) {
            console.error('❌ Erro ao adicionar anúncio:', error);
            return null;
        }
    }
    
    async removeAd(groupId, adId) {
        try {
            const ads = await this.loadAds();
            
            if (ads[groupId]) {
                ads[groupId] = ads[groupId].filter(ad => ad.id !== adId);
                await this.saveAds(ads);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Erro ao remover anúncio:', error);
            return false;
        }
    }
    
    async getGroupAds(groupId) {
        try {
            const ads = await this.loadAds();
            return ads[groupId] || [];
        } catch (error) {
            console.error('❌ Erro ao obter anúncios do grupo:', error);
            return [];
        }
    }
    
    parseInterval(interval) {
        const match = interval.match(/^(\d+)([smhd])$/);
        if (!match) return 60000; // 1 minuto padrão
        
        const value = parseInt(match[1]);
        const unit = match[2];
        
        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60 * 1000;
            case 'h': return value * 60 * 60 * 1000;
            case 'd': return value * 24 * 60 * 60 * 1000;
            default: return 60000;
        }
    }
}

/**
 * Gerencia tarefas agendadas
 */
class ScheduleManager {
    constructor() {
        this.scheduleFile = path.join(CONFIG_DIR, 'schedule.json');
    }
    
    async loadSchedules() {
        try {
            await fs.ensureDir(CONFIG_DIR);
            
            if (await fs.pathExists(this.scheduleFile)) {
                return await fs.readJSON(this.scheduleFile);
            }
            
            return {};
        } catch (error) {
            console.error('❌ Erro ao carregar agendamentos:', error);
            return {};
        }
    }
    
    async saveSchedules(schedules) {
        try {
            await fs.ensureDir(CONFIG_DIR);
            await fs.writeJSON(this.scheduleFile, schedules, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar agendamentos:', error);
            return false;
        }
    }
    
    async addSchedule(groupId, type, cron, data = {}) {
        try {
            const schedules = await this.loadSchedules();
            
            if (!schedules[groupId]) {
                schedules[groupId] = [];
            }
            
            const id = Date.now().toString();
            const schedule = {
                id,
                type,
                cron,
                data,
                active: true,
                created: new Date().toISOString()
            };
            
            schedules[groupId].push(schedule);
            await this.saveSchedules(schedules);
            
            return id;
        } catch (error) {
            console.error('❌ Erro ao adicionar agendamento:', error);
            return null;
        }
    }
    
    async removeSchedule(groupId, scheduleId) {
        try {
            const schedules = await this.loadSchedules();
            
            if (schedules[groupId]) {
                schedules[groupId] = schedules[groupId].filter(s => s.id !== scheduleId);
                await this.saveSchedules(schedules);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Erro ao remover agendamento:', error);
            return false;
        }
    }
    
    timeToCron(time) {
        const [hours, minutes] = time.split(':');
        return `${minutes} ${hours} * * *`;
    }
}

module.exports = {
    loadConfig,
    saveConfig,
    saveGroupConfig,
    getDefaultConfig,
    getGroupInfo,
    isGroupActive,
    updateLastActivity,
    AdsManager,
    ScheduleManager
};