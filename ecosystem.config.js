const name = 'swapforge-' + process.env.APP_ENV;

module.exports = {
  apps: [
    {
      name,
      script: 'npm start',
      cwd: './web-app',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        PORT: 3001,
        HOST: '0.0.0.0',
        APP_ENV: 'production',
      },
    },
  ],
  deploy: {
    production: {
      user: 'root',
      host: '203.161.38.116',
      ref: 'origin/main',
      repo: 'git@github.com:yasilvalmeida/swap-forge.git',
      fetch: 'all',
      path: '/home/webapp/swapforge',
      'pre-deploy-local': '',
      'pre-deploy': 'git reset --hard && git clean -fd',
      'post-deploy':
        'cd web-app && export APP_ENV=production && yarn && yarn build && pm2 reload ecosystem.config.js --env production && pm2 save',
      'pre-setup': '',
      ssh_options: 'ForwardAgent=yes',
    },
  },
};
