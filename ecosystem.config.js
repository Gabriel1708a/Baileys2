module.exports = {
  apps: [
    {
      name: 'whatsapp-bot',
      script: 'start.js',
      instances: 1,
      exec_mode: 'fork',
      
      // Configurações de restart
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      // Configurações de logs
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Variáveis de ambiente
      env: {
        NODE_ENV: 'production',
        TIMEZONE: 'America/Sao_Paulo'
      },
      
      // Configurações de desenvolvimento
      env_development: {
        NODE_ENV: 'development',
        DEBUG: true
      },
      
      // Configurações de produção
      env_production: {
        NODE_ENV: 'production',
        DEBUG: false
      },
      
      // Configurações de comportamento
      kill_timeout: 5000,
      listen_timeout: 5000,
      
      // Configurações de monitoramento
      min_uptime: '10s',
      max_restarts: 5,
      
      // Configurações de cron
      cron_restart: '0 2 * * *', // Restart às 2h da manhã
      
      // Configurações de merge logs
      merge_logs: true,
      
      // Configurações de ignore watch
      ignore_watch: [
        'node_modules',
        'logs',
        'sessions',
        'data',
        '.git'
      ],
      
      // Configurações de source map
      source_map_support: true,
      
      // Configurações de instance var
      instance_var: 'INSTANCE_ID',
      
      // Configurações de exponential backoff restart delay
      exp_backoff_restart_delay: 100,
      
      // Configurações de interpreter
      interpreter: 'node',
      interpreter_args: '--max-old-space-size=1024'
    }
  ],
  
  deploy: {
    // Configuração para deploy de produção
    production: {
      user: 'root',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-repo/whatsapp-bot.git',
      path: '/var/www/whatsapp-bot',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install nodejs npm git -y'
    },
    
    // Configuração para deploy de desenvolvimento
    development: {
      user: 'dev',
      host: 'dev-server.com',
      ref: 'origin/develop',
      repo: 'git@github.com:your-repo/whatsapp-bot.git',
      path: '/var/www/whatsapp-bot-dev',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env development'
    }
  }
};