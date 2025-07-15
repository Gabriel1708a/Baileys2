const fs = require('fs-extra');
const path = require('path');

/**
 * Carrega todos os comandos disponíveis
 * @returns {object} Objeto com todos os comandos
 */
async function loadCommands() {
    const commands = {};
    const commandsDir = path.join(__dirname, '..', 'commands');
    
    try {
        // Verificar se o diretório existe
        if (!await fs.pathExists(commandsDir)) {
            console.log('📁 Criando diretório de comandos...');
            await fs.ensureDir(commandsDir);
            return commands;
        }
        
        // Obter todos os arquivos .js do diretório
        const files = await fs.readdir(commandsDir);
        const commandFiles = files.filter(file => file.endsWith('.js'));
        
        // Carregar cada comando
        for (const file of commandFiles) {
            try {
                const commandPath = path.join(commandsDir, file);
                const command = require(commandPath);
                
                // Verificar se o comando tem a estrutura correta
                if (command.name && typeof command.execute === 'function') {
                    commands[command.name] = command.execute;
                    console.log(`📝 Comando carregado: ${command.name}`);
                } else {
                    console.warn(`⚠️ Comando inválido em ${file}: falta 'name' ou 'execute'`);
                }
            } catch (error) {
                console.error(`❌ Erro ao carregar comando ${file}:`, error);
            }
        }
        
        console.log(`✅ ${Object.keys(commands).length} comandos carregados com sucesso!`);
        return commands;
        
    } catch (error) {
        console.error('❌ Erro ao carregar comandos:', error);
        return commands;
    }
}

/**
 * Recarrega todos os comandos (útil para desenvolvimento)
 * @returns {object} Objeto com todos os comandos
 */
async function reloadCommands() {
    const commandsDir = path.join(__dirname, '..', 'commands');
    
    try {
        // Limpar cache do require
        const files = await fs.readdir(commandsDir);
        const commandFiles = files.filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const commandPath = path.join(commandsDir, file);
            delete require.cache[require.resolve(commandPath)];
        }
        
        return await loadCommands();
        
    } catch (error) {
        console.error('❌ Erro ao recarregar comandos:', error);
        return {};
    }
}

/**
 * Verifica se um comando existe
 * @param {string} commandName - Nome do comando
 * @returns {boolean} Se o comando existe
 */
function commandExists(commandName) {
    const commandsDir = path.join(__dirname, '..', 'commands');
    const commandPath = path.join(commandsDir, `${commandName}.js`);
    
    return fs.pathExistsSync(commandPath);
}

/**
 * Obtém informações sobre um comando
 * @param {string} commandName - Nome do comando
 * @returns {object|null} Informações do comando
 */
async function getCommandInfo(commandName) {
    try {
        const commandsDir = path.join(__dirname, '..', 'commands');
        const commandPath = path.join(commandsDir, `${commandName}.js`);
        
        if (!await fs.pathExists(commandPath)) {
            return null;
        }
        
        const command = require(commandPath);
        
        return {
            name: command.name,
            description: command.description || 'Sem descrição',
            usage: command.usage || `!${command.name}`,
            examples: command.examples || [],
            adminOnly: command.adminOnly || false,
            category: command.category || 'Geral'
        };
        
    } catch (error) {
        console.error(`❌ Erro ao obter informações do comando ${commandName}:`, error);
        return null;
    }
}

/**
 * Lista todos os comandos disponíveis com suas informações
 * @returns {Array} Lista de comandos
 */
async function listAllCommands() {
    const commandsDir = path.join(__dirname, '..', 'commands');
    const commandsList = [];
    
    try {
        if (!await fs.pathExists(commandsDir)) {
            return commandsList;
        }
        
        const files = await fs.readdir(commandsDir);
        const commandFiles = files.filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            try {
                const commandPath = path.join(commandsDir, file);
                const command = require(commandPath);
                
                if (command.name) {
                    commandsList.push({
                        name: command.name,
                        description: command.description || 'Sem descrição',
                        usage: command.usage || `!${command.name}`,
                        adminOnly: command.adminOnly || false,
                        category: command.category || 'Geral'
                    });
                }
            } catch (error) {
                console.error(`❌ Erro ao processar comando ${file}:`, error);
            }
        }
        
        return commandsList;
        
    } catch (error) {
        console.error('❌ Erro ao listar comandos:', error);
        return commandsList;
    }
}

module.exports = {
    loadCommands,
    reloadCommands,
    commandExists,
    getCommandInfo,
    listAllCommands
};