const name = 'swapforge-' + process.env.APP_ENV;

module.exports = {
  apps: [
    {
      name,
      script: 'npm start',
      cwd: './current',
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
};
