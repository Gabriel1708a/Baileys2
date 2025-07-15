const fs = require('fs-extra');
const path = require('path');

async function checkAndCreateDirectories() {
    console.log('🔧 Verificando estrutura de diretórios...');
    
    const dirs = [
        './sessions',
        './config',
        './data',
        './commands',
        './utils'
    ];
    
    for (const dir of dirs) {
        await fs.ensureDir(dir);
        console.log(`📁 Diretório ${dir} verificado`);
    }
}

async function checkDependencies() {
    console.log('📦 Verificando dependências...');
    
    const packagePath = './package.json';
    if (!await fs.pathExists(packagePath)) {
        console.error('❌ package.json não encontrado!');
        process.exit(1);
    }
    
    const nodeModulesPath = './node_modules';
    if (!await fs.pathExists(nodeModulesPath)) {
        console.error('❌ node_modules não encontrado! Execute: npm install');
        process.exit(1);
    }
    
    console.log('✅ Dependências verificadas');
}

async function showWelcomeMessage() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║  🤖 BOT ADMINISTRADOR WHATSAPP v1.0                           ║
║                                                                ║
║  ⚡ Powered by Baileys                                         ║
║  🔧 Sistema modular e robusto                                  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

🚀 Iniciando bot...
`);
}

async function main() {
    try {
        await showWelcomeMessage();
        await checkDependencies();
        await checkAndCreateDirectories();
        
        console.log('✅ Verificações concluídas!');
        console.log('📱 Iniciando conexão com WhatsApp...\n');
        
        // Iniciar o bot principal
        require('./index.js');
        
    } catch (error) {
        console.error('❌ Erro durante inicialização:', error);
        process.exit(1);
    }
}

main();