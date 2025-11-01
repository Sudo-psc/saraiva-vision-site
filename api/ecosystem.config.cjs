/**
 * PM2 Ecosystem Configuration
 * Author: Dr. Philipe Saraiva Cruz
 * Optimized for production with cluster mode and monitoring
 */

module.exports = {
  apps: [{
    name: 'saraiva-vision-api',
    script: './src/server.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',

    // Environment variables
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },

    // Performance optimizations
    max_memory_restart: '500M', // Restart if memory exceeds 500MB
    max_restarts: 10, // Maximum number of unstable restarts
    min_uptime: '10s', // Minimum uptime before considered stable

    // Logging
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,

    // Advanced features
    autorestart: true,
    watch: false, // Disable in production
    ignore_watch: ['node_modules', 'logs'],

    // Kill timeout
    kill_timeout: 5000,
    listen_timeout: 3000,

    // Process management
    wait_ready: true,
    shutdown_with_message: true
  }]
};
