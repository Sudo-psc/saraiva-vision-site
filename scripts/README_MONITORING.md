# Saraiva Vision Monitoring System

## 🏥 Overview

This comprehensive monitoring system has been deployed for the Saraiva Vision medical platform to ensure continuous health monitoring, alerting, and performance tracking for production stability.

## 📁 Monitoring Scripts

### Core Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `health-monitor.sh` | Complete system health check | `sudo ./health-monitor.sh` |
| `monitor-daemon.sh` | Continuous monitoring daemon | `sudo ./monitor-daemon.sh {start|stop|status}` |
| `alert-system.sh` | Alert and warning detection | `sudo ./alert-system.sh` |
| `monitoring-dashboard.sh` | Real-time dashboard view | `sudo ./monitoring-dashboard.sh [--continuous]` |

### Monitoring Features

#### ✅ System Resources
- CPU usage monitoring (threshold: 80%)
- Memory usage tracking (threshold: 85%)
- Disk space monitoring (threshold: 90%)
- Load average and temperature tracking

#### ✅ Service Health
- Nginx web server status
- Saraiva API service monitoring
- Redis cache service status
- Process tracking and PID monitoring

#### ✅ Website Health
- Main website availability (HTTP 200 check)
- API endpoint health checking
- Response time monitoring (threshold: 5 seconds)
- SSL certificate expiration tracking (30-day warning)

#### ✅ Security Monitoring
- Nginx error rate analysis
- Suspicious request detection
- Failed authentication attempts
- Automated scan identification

#### ✅ Application Monitoring
- Google Reviews API functionality
- Contact form service status
- Rate limiting and validation checks
- Recent deployment tracking

## 🚀 Quick Start

### Start Continuous Monitoring
```bash
cd /home/saraiva-vision-site/scripts
sudo ./monitor-daemon.sh start
```

### View Real-time Dashboard
```bash
sudo ./monitoring-dashboard.sh
# For auto-refresh:
sudo ./monitoring-dashboard.sh --continuous
```

### Run Single Health Check
```bash
sudo ./health-monitor.sh
```

### Check Alert System
```bash
sudo ./alert-system.sh
```

### Monitor Status
```bash
sudo ./monitor-daemon.sh status
```

## 📊 Monitoring Dashboard

The dashboard provides real-time visibility into:
- System resource usage with color-coded alerts
- Service status with PID tracking
- Website health with response times
- Recent activity and visitor metrics
- Security status and threat detection
- Git repository status and recent commits
- Recent alerts and system notifications

## 🚨 Alert System

### Alert Levels
- **CRITICAL**: Service downtime, website unavailable, disk space critical
- **WARNING**: High resource usage, increasing error rates, suspicious activity
- **INFO**: General status updates and system information

### Alert Destinations
- System logger (`/var/log/saraiva-alerts.log`)
- System journal (visible via `journalctl`)
- Console output for immediate visibility
- Future: Email/SMS notifications (configurable)

## 📋 Log Files

| Log File | Purpose | Location |
|----------|---------|----------|
| `saraiva-health-monitor.log` | Health check results | `/var/log/` |
| `saraiva-alerts.log` | Alert notifications | `/var/log/` |
| `nginx/access.log` | Web access logs | `/var/log/nginx/` |
| `nginx/error.log` | Web error logs | `/var/log/nginx/` |
| System journal | Service logs | `journalctl -u saraiva-api` |

## ⚙️ Configuration

### Monitoring Intervals
- **Health Checks**: Every 5 minutes (300 seconds)
- **Dashboard Refresh**: Every 30 seconds (continuous mode)
- **Alert Checks**: On-demand (can be automated via cron)

### Thresholds (configurable in scripts)
- CPU: 80% usage alert
- Memory: 85% usage alert
- Disk: 90% usage alert
- Response Time: 5 seconds alert
- SSL Certificate: 30 days warning

## 🔧 Troubleshooting

### Common Issues

#### Monitoring Daemon Not Starting
```bash
# Check if already running
sudo ./monitor-daemon.sh status

# Stop and restart
sudo ./monitor-daemon.sh stop
sudo ./monitor-daemon.sh start
```

#### High Error Rates in Nginx
```bash
# Check recent errors
sudo tail -50 /var/log/nginx/error.log

# Investigate suspicious activity
sudo ./alert-system.sh
```

#### Service Status Issues
```bash
# Check individual services
systemctl status nginx
systemctl status saraiva-api
systemctl status redis-server
```

## 📈 Performance Impact

The monitoring system is designed for minimal performance impact:
- Lightweight bash scripts
- Non-intrusive health checks
- Efficient log parsing
- Minimal resource overhead (<1% CPU, <50MB memory)

## 🔒 Security Considerations

- All scripts require sudo privileges for system access
- Logs contain system information - protect accordingly
- No external dependencies or network calls beyond health checks
- Configurable alert destinations for secure notifications

## 📞 Support

For monitoring system issues:
1. Check log files in `/var/log/`
2. Run individual scripts to isolate issues
3. Review system status with dashboard
4. Consult system administrator for persistent issues

## 🔄 Automated Deployment

The monitoring system runs automatically after system boot and can be integrated into deployment pipelines to ensure continuous oversight of the medical platform's health and performance.

---

**Last Updated**: 2025-10-01
**System**: Saraiva Vision Medical Platform
**Compliance**: CFM/LGPD Healthcare Standards