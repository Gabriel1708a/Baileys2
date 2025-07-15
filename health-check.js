const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');

async function checkHealth() {
    console.log('🔍 Verificando saúde do bot...\n');
    
    const results = {
        timestamp: moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss'),
        checks: {},
        overall: 'healthy'
    };
    
    // Verificar diretórios essenciais
    await checkDirectories(results);
    
    // Verificar arquivos de configuração
    await checkConfigFiles(results);
    
    // Verificar dependências
    await checkDependencies(results);
    
    // Verificar logs
    await checkLogs(results);
    
    // Gerar relatório
    generateReport(results);
    
    return results;
}

async function checkDirectories(results) {
    console.log('📁 Verificando diretórios...');
    
    const directories = [
        './sessions',
        './config',
        './data',
        './commands',
        './utils'
    ];
    
    results.checks.directories = {};
    
    for (const dir of directories) {
        const exists = await fs.pathExists(dir);
        results.checks.directories[dir] = exists ? 'OK' : 'MISSING';
        
        if (!exists) {
            results.overall = 'warning';
            console.log(`  ⚠️  ${dir} - MISSING`);
        } else {
            console.log(`  ✅ ${dir} - OK`);
        }
    }
}

async function checkConfigFiles(results) {
    console.log('\n📄 Verificando arquivos de configuração...');
    
    const configFiles = [
        './package.json',
        './index.js',
        './start.js'
    ];
    
    results.checks.configFiles = {};
    
    for (const file of configFiles) {
        const exists = await fs.pathExists(file);
        results.checks.configFiles[file] = exists ? 'OK' : 'MISSING';
        
        if (!exists) {
            results.overall = 'error';
            console.log(`  ❌ ${file} - MISSING`);
        } else {
            console.log(`  ✅ ${file} - OK`);
        }
    }
}

async function checkDependencies(results) {
    console.log('\n📦 Verificando dependências...');
    
    results.checks.dependencies = {};
    
    try {
        const packageJson = await fs.readJSON('./package.json');
        const nodeModulesExists = await fs.pathExists('./node_modules');
        
        results.checks.dependencies.packageJson = 'OK';
        results.checks.dependencies.nodeModules = nodeModulesExists ? 'OK' : 'MISSING';
        
        if (!nodeModulesExists) {
            results.overall = 'error';
            console.log('  ❌ node_modules - MISSING (execute: npm install)');
        } else {
            console.log('  ✅ node_modules - OK');
        }
        
        // Verificar dependências críticas
        const criticalDeps = [
            '@whiskeysockets/baileys',
            'moment-timezone',
            'fs-extra',
            'pino'
        ];
        
        for (const dep of criticalDeps) {
            const depPath = path.join('./node_modules', dep);
            const exists = await fs.pathExists(depPath);
            
            if (!exists) {
                results.overall = 'error';
                console.log(`  ❌ ${dep} - MISSING`);
            } else {
                console.log(`  ✅ ${dep} - OK`);
            }
        }
        
    } catch (error) {
        results.checks.dependencies.error = error.message;
        results.overall = 'error';
        console.log('  ❌ Erro ao verificar dependências:', error.message);
    }
}

async function checkLogs(results) {
    console.log('\n📋 Verificando logs...');
    
    results.checks.logs = {};
    
    const logDir = './logs';
    const logsExist = await fs.pathExists(logDir);
    
    if (!logsExist) {
        await fs.ensureDir(logDir);
        console.log('  📁 Diretório de logs criado');
    }
    
    results.checks.logs.directory = 'OK';
    
    // Verificar tamanho dos logs
    try {
        const logFiles = ['combined.log', 'out.log', 'error.log'];
        
        for (const logFile of logFiles) {
            const logPath = path.join(logDir, logFile);
            
            if (await fs.pathExists(logPath)) {
                const stats = await fs.stat(logPath);
                const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
                
                results.checks.logs[logFile] = `${sizeInMB}MB`;
                console.log(`  📄 ${logFile} - ${sizeInMB}MB`);
                
                if (stats.size > 50 * 1024 * 1024) { // 50MB
                    console.log(`  ⚠️  ${logFile} está muito grande (${sizeInMB}MB)`);
                }
            } else {
                results.checks.logs[logFile] = 'NOT_FOUND';
                console.log(`  📄 ${logFile} - Não encontrado`);
            }
        }
    } catch (error) {
        results.checks.logs.error = error.message;
        console.log('  ❌ Erro ao verificar logs:', error.message);
    }
}

function generateReport(results) {
    console.log('\n' + '='.repeat(60));
    console.log(`🏥 RELATÓRIO DE SAÚDE - ${results.timestamp}`);
    console.log('='.repeat(60));
    
    const statusEmoji = {
        'healthy': '✅',
        'warning': '⚠️',
        'error': '❌'
    };
    
    console.log(`Status Geral: ${statusEmoji[results.overall]} ${results.overall.toUpperCase()}`);
    console.log('');
    
    // Salvar relatório em arquivo
    const reportPath = './logs/health-report.json';
    fs.writeJSON(reportPath, results, { spaces: 2 })
        .then(() => console.log(`📄 Relatório salvo em: ${reportPath}`))
        .catch(err => console.error('❌ Erro ao salvar relatório:', err));
}

// Executar verificação se chamado diretamente
if (require.main === module) {
    checkHealth()
        .then(results => {
            process.exit(results.overall === 'healthy' ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Erro durante verificação:', error);
            process.exit(1);
        });
}

module.exports = { checkHealth };