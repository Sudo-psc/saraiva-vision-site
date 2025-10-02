#!/bin/bash

# Saraiva Vision Monitoring Daemon
# Runs continuous health checks with configurable intervals

MONITOR_SCRIPT="/home/saraiva-vision-site/scripts/health-monitor.sh"
PIDFILE="/var/run/saraiva-monitor.pid"
LOG_FILE="/var/log/saraiva-health-monitor.log"
INTERVAL=300  # 5 minutes

# Function to start monitoring
start_monitoring() {
    if [ -f "$PIDFILE" ]; then
        local existing_pid=$(cat "$PIDFILE")
        if kill -0 "$existing_pid" 2>/dev/null; then
            echo "Monitoring is already running with PID $existing_pid"
            exit 1
        else
            rm -f "$PIDFILE"
        fi
    fi

    echo "Starting Saraiva Vision Health Monitor..."
    echo "Monitoring interval: ${INTERVAL} seconds"
    echo "Log file: $LOG_FILE"
    echo "PID file: $PIDFILE"

    # Start monitoring in background
    (
        while true; do
            $MONITOR_SCRIPT
            sleep $INTERVAL
        done
    ) &

    local pid=$!
    echo $pid > "$PIDFILE"
    echo "Monitoring started with PID $pid"
}

# Function to stop monitoring
stop_monitoring() {
    if [ -f "$PIDFILE" ]; then
        local pid=$(cat "$PIDFILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            rm -f "$PIDFILE"
            echo "Monitoring stopped (PID $pid)"
        else
            echo "Monitoring process not found"
            rm -f "$PIDFILE"
        fi
    else
        echo "No monitoring process running"
    fi
}

# Function to check status
check_status() {
    if [ -f "$PIDFILE" ]; then
        local pid=$(cat "$PIDFILE")
        if kill -0 "$pid" 2>/dev/null; then
            echo "Monitoring is running with PID $pid"
            echo "Log file: $LOG_FILE"
            echo "Interval: ${INTERVAL} seconds"
            echo "Last check: $(tail -1 "$LOG_FILE" 2>/dev/null || echo "No logs yet")"
        else
            echo "PID file exists but process not running"
            rm -f "$PIDFILE"
        fi
    else
        echo "Monitoring is not running"
    fi
}

# Function to show recent logs
show_logs() {
    local lines=${1:-20}
    echo "Recent $lines lines from $LOG_FILE:"
    tail -"$lines" "$LOG_FILE"
}

# Main script logic
case "$1" in
    start)
        start_monitoring
        ;;
    stop)
        stop_monitoring
        ;;
    restart)
        stop_monitoring
        sleep 2
        start_monitoring
        ;;
    status)
        check_status
        ;;
    logs)
        show_logs "$2"
        ;;
    check)
        $MONITOR_SCRIPT
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs [lines]|check}"
        echo ""
        echo "Commands:"
        echo "  start   - Start monitoring daemon"
        echo "  stop    - Stop monitoring daemon"
        echo "  restart - Restart monitoring daemon"
        echo "  status  - Show monitoring status"
        echo "  logs    - Show recent logs (default 20 lines)"
        echo "  check   - Run single health check"
        exit 1
        ;;
esac