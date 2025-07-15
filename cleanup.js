const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');

async function cleanup() {
    console.log('🧹 Iniciando limpeza do sistema...\n');
    
    const results = {
        timestamp: moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss'),
        cleaned: {},
        errors: [],
        totalCleaned: 0
    };
    
    // Limpar logs antigos
    await cleanOldLogs(results);
    
    // Limpar dados temporários
    await cleanTempData(results);
    
    // Limpar sessões inválidas
    await cleanInvalidSessions(results);
    
    // Otimizar arquivos JSON
    await optimizeJsonFiles(results);
    
    // Gerar relatório
    generateCleanupReport(results);
    
    return results;
}

async function cleanOldLogs(results) {
    console.log('📋 Limpando logs antigos...');
    
    const logDir = './logs';
    const maxLogAge = 7; // dias
    const maxLogSize = 50 * 1024 * 1024; // 50MB
    
    results.cleaned.logs = {};
    
    try {
        if (!await fs.pathExists(logDir)) {
            console.log('  📁 Diretório de logs não encontrado');
            return;
        }
        
        const logFiles = await fs.readdir(logDir);
        const cutoffDate = moment().subtract(maxLogAge, 'days');
        
        for (const file of logFiles) {
            const filePath = path.join(logDir, file);
            const stats = await fs.stat(filePath);
            const fileAge = moment(stats.mtime);
            const fileSize = stats.size;
            
            let shouldClean = false;
            let reason = '';
            
            // Verificar idade
            if (fileAge.isBefore(cutoffDate)) {
                shouldClean = true;
                reason = `muito antigo (${fileAge.fromNow()})`;
            }
            
            // Verificar tamanho
            if (fileSize > maxLogSize) {
                shouldClean = true;
                reason = `muito grande (${(fileSize / (1024 * 1024)).toFixed(2)}MB)`;
            }
            
            if (shouldClean) {
                try {
                    await fs.remove(filePath);
                    console.log(`  🗑️  ${file} - removido (${reason})`);
                    results.cleaned.logs[file] = reason;
                    results.totalCleaned++;
                } catch (error) {
                    console.log(`  ❌ Erro ao remover ${file}: ${error.message}`);
                    results.errors.push(`Erro ao remover ${file}: ${error.message}`);
                }
            } else {
                const sizeInMB = (fileSize / (1024 * 1024)).toFixed(2);
                console.log(`  ✅ ${file} - mantido (${sizeInMB}MB, ${fileAge.fromNow()})`);
            }
        }
        
    } catch (error) {
        console.log('  ❌ Erro ao limpar logs:', error.message);
        results.errors.push(`Erro ao limpar logs: ${error.message}`);
    }
}

async function cleanTempData(results) {
    console.log('\n🗂️  Limpando dados temporários...');
    
    const tempDirs = [
        './temp',
        './tmp',
        './cache'
    ];
    
    results.cleaned.temp = {};
    
    for (const dir of tempDirs) {
        try {
            if (await fs.pathExists(dir)) {
                const files = await fs.readdir(dir);
                
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    await fs.remove(filePath);
                    console.log(`  🗑️  ${filePath} - removido`);
                    results.cleaned.temp[filePath] = 'removido';
                    results.totalCleaned++;
                }
                
                if (files.length === 0) {
                    console.log(`  📁 ${dir} - vazio`);
                }
            }
        } catch (error) {
            console.log(`  ❌ Erro ao limpar ${dir}: ${error.message}`);
            results.errors.push(`Erro ao limpar ${dir}: ${error.message}`);
        }
    }
}

async function cleanInvalidSessions(results) {
    console.log('\n🔐 Verificando sessões...');
    
    const sessionDir = './sessions';
    results.cleaned.sessions = {};
    
    try {
        if (!await fs.pathExists(sessionDir)) {
            console.log('  📁 Diretório de sessões não encontrado');
            return;
        }
        
        const sessionFiles = await fs.readdir(sessionDir);
        
        for (const file of sessionFiles) {
            const filePath = path.join(sessionDir, file);
            const stats = await fs.stat(filePath);
            
            // Verificar se o arquivo está muito antigo (mais de 30 dias sem modificação)
            const fileAge = moment(stats.mtime);
            const cutoffDate = moment().subtract(30, 'days');
            
            if (fileAge.isBefore(cutoffDate)) {
                try {
                    await fs.remove(filePath);
                    console.log(`  🗑️  ${file} - removido (inativo há ${fileAge.fromNow()})`);
                    results.cleaned.sessions[file] = 'inativo';
                    results.totalCleaned++;
                } catch (error) {
                    console.log(`  ❌ Erro ao remover ${file}: ${error.message}`);
                    results.errors.push(`Erro ao remover sessão ${file}: ${error.message}`);
                }
            } else {
                console.log(`  ✅ ${file} - ativo (${fileAge.fromNow()})`);
            }
        }
        
    } catch (error) {
        console.log('  ❌ Erro ao verificar sessões:', error.message);
        results.errors.push(`Erro ao verificar sessões: ${error.message}`);
    }
}

async function optimizeJsonFiles(results) {
    console.log('\n🔧 Otimizando arquivos JSON...');
    
    const jsonFiles = [
        './data/groups.json',
        './data/ads.json',
        './data/schedule.json'
    ];
    
    results.cleaned.optimized = {};
    
    for (const file of jsonFiles) {
        try {
            if (await fs.pathExists(file)) {
                const data = await fs.readJSON(file);
                
                // Remover entradas vazias ou inválidas
                let cleaned = false;
                
                if (Array.isArray(data)) {
                    const originalLength = data.length;
                    const cleanedData = data.filter(item => item && typeof item === 'object');
                    
                    if (cleanedData.length < originalLength) {
                        await fs.writeJSON(file, cleanedData, { spaces: 2 });
                        cleaned = true;
                    }
                } else if (typeof data === 'object' && data !== null) {
                    const cleanedData = {};
                    let hasChanges = false;
                    
                    for (const [key, value] of Object.entries(data)) {
                        if (value && typeof value === 'object') {
                            cleanedData[key] = value;
                        } else if (value !== null && value !== undefined) {
                            cleanedData[key] = value;
                        } else {
                            hasChanges = true;
                        }
                    }
                    
                    if (hasChanges) {
                        await fs.writeJSON(file, cleanedData, { spaces: 2 });
                        cleaned = true;
                    }
                }
                
                if (cleaned) {
                    console.log(`  🔧 ${file} - otimizado`);
                    results.cleaned.optimized[file] = 'otimizado';
                    results.totalCleaned++;
                } else {
                    console.log(`  ✅ ${file} - já otimizado`);
                }
            }
        } catch (error) {
            console.log(`  ❌ Erro ao otimizar ${file}: ${error.message}`);
            results.errors.push(`Erro ao otimizar ${file}: ${error.message}`);
        }
    }
}

function generateCleanupReport(results) {
    console.log('\n' + '='.repeat(60));
    console.log(`🧹 RELATÓRIO DE LIMPEZA - ${results.timestamp}`);
    console.log('='.repeat(60));
    
    console.log(`📊 Total de itens limpos: ${results.totalCleaned}`);
    console.log(`❌ Erros encontrados: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
        console.log('\n❌ Erros:');
        results.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    // Salvar relatório
    const reportPath = './logs/cleanup-report.json';
    fs.ensureDir('./logs')
        .then(() => fs.writeJSON(reportPath, results, { spaces: 2 }))
        .then(() => console.log(`\n📄 Relatório salvo em: ${reportPath}`))
        .catch(err => console.error('❌ Erro ao salvar relatório:', err));
}

// Executar limpeza se chamado diretamente
if (require.main === module) {
    cleanup()
        .then(results => {
            console.log('\n✅ Limpeza concluída!');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Erro durante limpeza:', error);
            process.exit(1);
        });
}

module.exports = { cleanup };