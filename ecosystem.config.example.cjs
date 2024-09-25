module.exports = {
  apps: [
    {
      name: 'ip-to-domain',
      script: 'src/index.ts', 
      interpreter: '~/.bun/bin/bun', 
    },
    {
      name: 'domain-discovery-cron',
      script: 'src/utils/queue/add/discovery.ts', 
      interpreter: '~/.bun/bin/bun', 
      cron_restart: '0 16 * * *', 
      autorestart: false, 
    },
  ],
};
