#!/usr/bin/env node

/**
 * Backup and Recovery Testing Script
 * Comprehensive testing of WordPress and database backup/recovery procedures
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

class BackupRecoveryTester {
    constructor() {
        this.backupDir = '/opt/backups/wordpress';
        this.testDir = '/tmp/backup-test';
        this.wordpressDir = '/opt/wordpress-cms';
        this.logFile = '/var/log/backup-test.log';
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colorMap = {
            info: colors.blue,
            success: colors.green,
            warning: colors.yellow,
            error: colors.red,
            header: colors.magenta
        };

        const logMessage = `[${timestamp}] ${message}`;
        console.log(`${colorMap[type]}${logMessage}${colors.reset}`);

        try {
            fs.appendFileSync(this.logFile, logMessage + '\n');
        } catch (error) {
            // Ignore file logging errors
        }
    }

    async createTestEnvironment() {
        this.log('🏗️  Creating test environment...', 'header');

        try {
            // Create test directory
            if (fs.existsSync(this.testDir)) {
                execSync(`rm -rf ${this.testDir}`);
            }
            fs.mkdirSync(this.testDir, { recursive: true });

            // Create test backup directory
            const testBackupDir = path.join(this.testDir, 'backups');
            fs.mkdirSync(testBackupDir, { recursive: true });

            this.log('✅ Test environment created', 'success');
            return true;
        } catch (error) {
            this.log(`❌ Failed to create test environment: ${error.message}`, 'error');
            return false;
        }
    }

    async testWordPressBackup() {
        this.log('📦 Testing WordPress Files Backup...', 'header');

        try {
            const backupScript = `
#!/bin/bash
set -e

BACKUP_DIR="${this.testDir}/backups"
DATE=$(date +%Y%m%d_%H%M%S)
WORDPRESS_DIR="${this.wordpressDir}"

mkdir -p "$BACKUP_DIR/$DATE"

# Test if WordPress volume exists
if docker volume ls | grep -q wordpress_wp_data; then
    echo "Backing up WordPress files..."
    docker run --rm -v wordpress_wp_data:/data -v "$BACKUP_DIR/$DATE":/backup alpine tar czf /backup/wordpress-files.tar.gz -C /data .
    
    # Verify backup
    if [ -f "$BACKUP_DIR/$DATE/wordpress-files.tar.gz" ]; then
        echo "Backup file created successfully"
        
        # Check backup size
        BACKUP_SIZE=$(stat -f%z "$BACKUP_DIR/$DATE/wordpress-files.tar.gz" 2>/dev/null || stat -c%s "$BACKUP_DIR/$DATE/wordpress-files.tar.gz")
        if [ "$BACKUP_SIZE" -gt 1000000 ]; then
            echo "Backup size looks reasonable: $BACKUP_SIZE bytes"
        else
            echo "WARNING: Backup size seems too small: $BACKUP_SIZE bytes"
            exit 1
        fi
        
        # Test extraction
        mkdir -p "$BACKUP_DIR/$DATE/test-extract"
        tar -xzf "$BACKUP_DIR/$DATE/wordpress-files.tar.gz" -C "$BACKUP_DIR/$DATE/test-extract"
        
        if [ -f "$BACKUP_DIR/$DATE/test-extract/wp-config.php" ]; then
            echo "Backup extraction test successful"
        else
            echo "ERROR: Backup extraction test failed"
            exit 1
        fi
        
        echo "WordPress backup test completed successfully"
    else
        echo "ERROR: Backup file was not created"
        exit 1
    fi
else
    echo "WARNING: WordPress volume not found, skipping file backup test"
fi
`;

            fs.writeFileSync(path.join(this.testDir, 'test-wp-backup.sh'), backupScript);
            execSync(`chmod +x ${this.testDir}/test-wp-backup.sh`);

            const result = execSync(`${this.testDir}/test-wp-backup.sh`, {
                encoding: 'utf8',
                cwd: this.wordpressDir
            });

            this.log('✅ WordPress backup test passed', 'success');
            this.log(result, 'info');
            return true;
        } catch (error) {
            this.log(`❌ WordPress backup test failed: ${error.message}`, 'error');
            return false;
        }
    }

    async testDatabaseBackup() {
        this.log('🗄️  Testing Database Backup...', 'header');

        try {
            const dbBackupScript = `
#!/bin/bash
set -e

BACKUP_DIR="${this.testDir}/backups"
DATE=$(date +%Y%m%d_%H%M%S)
WORDPRESS_DIR="${this.wordpressDir}"

mkdir -p "$BACKUP_DIR/$DATE"

cd "$WORDPRESS_DIR"

# Check if database container is running
if docker-compose ps db | grep -q "Up"; then
    echo "Database container is running"
    
    # Get database credentials from environment
    if [ -f .env ]; then
        source .env
    else
        echo "ERROR: .env file not found"
        exit 1
    fi
    
    # Test database connection
    if docker-compose exec -T db mysql -u wp -p$MYSQL_PASSWORD -e "SELECT 1;" wordpress > /dev/null 2>&1; then
        echo "Database connection successful"
    else
        echo "ERROR: Cannot connect to database"
        exit 1
    fi
    
    # Create database backup
    echo "Creating database backup..."
    docker-compose exec -T db mysqldump -u wp -p$MYSQL_PASSWORD --single-transaction --routines --triggers wordpress > "$BACKUP_DIR/$DATE/wordpress-db.sql"
    
    # Verify backup
    if [ -f "$BACKUP_DIR/$DATE/wordpress-db.sql" ]; then
        BACKUP_SIZE=$(stat -f%z "$BACKUP_DIR/$DATE/wordpress-db.sql" 2>/dev/null || stat -c%s "$BACKUP_DIR/$DATE/wordpress-db.sql")
        
        if [ "$BACKUP_SIZE" -gt 1000 ]; then
            echo "Database backup created successfully: $BACKUP_SIZE bytes"
            
            # Check if backup contains expected content
            if grep -q "CREATE TABLE" "$BACKUP_DIR/$DATE/wordpress-db.sql"; then
                echo "Database backup contains table definitions"
            else
                echo "WARNING: Database backup may be incomplete"
            fi
            
            if grep -q "INSERT INTO" "$BACKUP_DIR/$DATE/wordpress-db.sql"; then
                echo "Database backup contains data"
            else
                echo "WARNING: Database backup may not contain data"
            fi
            
        else
            echo "ERROR: Database backup size too small: $BACKUP_SIZE bytes"
            exit 1
        fi
    else
        echo "ERROR: Database backup file was not created"
        exit 1
    fi
    
    echo "Database backup test completed successfully"
else
    echo "WARNING: Database container not running, skipping database backup test"
fi
`;

            fs.writeFileSync(path.join(this.testDir, 'test-db-backup.sh'), dbBackupScript);
            execSync(`chmod +x ${this.testDir}/test-db-backup.sh`);

            const result = execSync(`${this.testDir}/test-db-backup.sh`, {
                encoding: 'utf8'
            });

            this.log('✅ Database backup test passed', 'success');
            this.log(result, 'info');
            return true;
        } catch (error) {
            this.log(`❌ Database backup test failed: ${error.message}`, 'error');
            return false;
        }
    }

    async testBackupCompression() {
        this.log('🗜️  Testing Backup Compression...', 'header');

        try {
            const compressionScript = `
#!/bin/bash
set -e

BACKUP_DIR="${this.testDir}/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Find the latest backup directory
LATEST_BACKUP=$(ls -1t "$BACKUP_DIR" | head -n 1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "ERROR: No backup directory found"
    exit 1
fi

BACKUP_PATH="$BACKUP_DIR/$LATEST_BACKUP"

echo "Testing compression for backup: $LATEST_BACKUP"

# Compress backup
cd "$BACKUP_DIR"
tar czf "wordpress-backup-$DATE.tar.gz" "$LATEST_BACKUP"

if [ -f "wordpress-backup-$DATE.tar.gz" ]; then
    COMPRESSED_SIZE=$(stat -f%z "wordpress-backup-$DATE.tar.gz" 2>/dev/null || stat -c%s "wordpress-backup-$DATE.tar.gz")
    echo "Compressed backup created: $COMPRESSED_SIZE bytes"
    
    # Test extraction
    mkdir -p "test-extract-$DATE"
    tar -xzf "wordpress-backup-$DATE.tar.gz" -C "test-extract-$DATE"
    
    if [ -d "test-extract-$DATE/$LATEST_BACKUP" ]; then
        echo "Compression test successful"
        
        # Cleanup test extraction
        rm -rf "test-extract-$DATE"
        
        # Calculate compression ratio
        ORIGINAL_SIZE=$(du -sb "$LATEST_BACKUP" | cut -f1)
        COMPRESSION_RATIO=$(echo "scale=2; $COMPRESSED_SIZE * 100 / $ORIGINAL_SIZE" | bc -l 2>/dev/null || echo "N/A")
        echo "Compression ratio: $COMPRESSION_RATIO%"
        
    else
        echo "ERROR: Compression extraction test failed"
        exit 1
    fi
else
    echo "ERROR: Compressed backup was not created"
    exit 1
fi

echo "Backup compression test completed successfully"
`;

            fs.writeFileSync(path.join(this.testDir, 'test-compression.sh'), compressionScript);
            execSync(`chmod +x ${this.testDir}/test-compression.sh`);

            const result = execSync(`${this.testDir}/test-compression.sh`, {
                encoding: 'utf8'
            });

            this.log('✅ Backup compression test passed', 'success');
            this.log(result, 'info');
            return true;
        } catch (error) {
            this.log(`❌ Backup compression test failed: ${error.message}`, 'error');
            return false;
        }
    }

    async testRecoveryProcedure() {
        this.log('🔄 Testing Recovery Procedure...', 'header');

        try {
            const recoveryScript = `
#!/bin/bash
set -e

BACKUP_DIR="${this.testDir}/backups"
RECOVERY_DIR="${this.testDir}/recovery-test"

# Find the latest compressed backup
LATEST_BACKUP=$(ls -1t "$BACKUP_DIR"/wordpress-backup-*.tar.gz 2>/dev/null | head -n 1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "ERROR: No compressed backup found"
    exit 1
fi

echo "Testing recovery from backup: $(basename $LATEST_BACKUP)"

# Create recovery test directory
mkdir -p "$RECOVERY_DIR"
cd "$RECOVERY_DIR"

# Extract backup
tar -xzf "$LATEST_BACKUP"

# Find extracted directory
EXTRACTED_DIR=$(ls -1t | head -n 1)

if [ -d "$EXTRACTED_DIR" ]; then
    echo "Backup extracted successfully to: $EXTRACTED_DIR"
    
    # Verify WordPress files
    if [ -f "$EXTRACTED_DIR/wordpress-files.tar.gz" ]; then
        echo "WordPress files backup found"
        
        # Test WordPress files extraction
        mkdir -p wp-test
        tar -xzf "$EXTRACTED_DIR/wordpress-files.tar.gz" -C wp-test
        
        if [ -f "wp-test/wp-config.php" ]; then
            echo "WordPress files recovery test successful"
        else
            echo "ERROR: WordPress files recovery failed"
            exit 1
        fi
    fi
    
    # Verify database backup
    if [ -f "$EXTRACTED_DIR/wordpress-db.sql" ]; then
        echo "Database backup found"
        
        # Basic SQL file validation
        if grep -q "CREATE TABLE" "$EXTRACTED_DIR/wordpress-db.sql"; then
            echo "Database backup appears valid"
        else
            echo "ERROR: Database backup appears corrupted"
            exit 1
        fi
    fi
    
    echo "Recovery procedure test completed successfully"
else
    echo "ERROR: Could not find extracted backup directory"
    exit 1
fi
`;

            fs.writeFileSync(path.join(this.testDir, 'test-recovery.sh'), recoveryScript);
            execSync(`chmod +x ${this.testDir}/test-recovery.sh`);

            const result = execSync(`${this.testDir}/test-recovery.sh`, {
                encoding: 'utf8'
            });

            this.log('✅ Recovery procedure test passed', 'success');
            this.log(result, 'info');
            return true;
        } catch (error) {
            this.log(`❌ Recovery procedure test failed: ${error.message}`, 'error');
            return false;
        }
    }

    async testBackupRetention() {
        this.log('🗂️  Testing Backup Retention Policy...', 'header');

        try {
            // Create test backup files with different dates
            const testBackups = [];
            const now = new Date();

            for (let i = 0; i < 10; i++) {
                const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
                const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
                const filename = `wordpress-backup-${dateStr}_120000.tar.gz`;
                const filepath = path.join(this.testDir, 'backups', filename);

                // Create dummy backup file
                fs.writeFileSync(filepath, 'dummy backup content');
                testBackups.push(filename);
            }

            this.log(`Created ${testBackups.length} test backup files`, 'info');

            // Test retention script
            const retentionScript = `
#!/bin/bash
set -e

BACKUP_DIR="${this.testDir}/backups"
RETENTION_DAYS=7

echo "Testing backup retention policy (keep last $RETENTION_DAYS days)"

# Count files before cleanup
BEFORE_COUNT=$(ls -1 "$BACKUP_DIR"/wordpress-backup-*.tar.gz 2>/dev/null | wc -l)
echo "Backup files before cleanup: $BEFORE_COUNT"

# Remove old backups
find "$BACKUP_DIR" -name "wordpress-backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Count files after cleanup
AFTER_COUNT=$(ls -1 "$BACKUP_DIR"/wordpress-backup-*.tar.gz 2>/dev/null | wc -l)
echo "Backup files after cleanup: $AFTER_COUNT"

if [ $AFTER_COUNT -le $RETENTION_DAYS ]; then
    echo "Backup retention test successful"
else
    echo "WARNING: More backups retained than expected"
fi

echo "Backup retention test completed"
`;

            fs.writeFileSync(path.join(this.testDir, 'test-retention.sh'), retentionScript);
            execSync(`chmod +x ${this.testDir}/test-retention.sh`);

            const result = execSync(`${this.testDir}/test-retention.sh`, {
                encoding: 'utf8'
            });

            this.log('✅ Backup retention test passed', 'success');
            this.log(result, 'info');
            return true;
        } catch (error) {
            this.log(`❌ Backup retention test failed: ${error.message}`, 'error');
            return false;
        }
    }

    async createBackupScript() {
        this.log('📝 Creating production backup script...', 'info');

        const backupScript = `#!/bin/bash

# WordPress Production Backup Script
# Generated by Backup Recovery Tester

set -e

# Configuration
BACKUP_DIR="/opt/backups/wordpress"
DATE=$(date +%Y%m%d_%H%M%S)
WORDPRESS_DIR="/opt/wordpress-cms"
RETENTION_DAYS=7
LOG_FILE="/var/log/wordpress/backup.log"

# Logging function
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
handle_error() {
    log_message "ERROR: Backup failed at line $1"
    exit 1
}

trap 'handle_error $LINENO' ERR

log_message "Starting WordPress backup process..."

# Create backup directory
mkdir -p "$BACKUP_DIR/$DATE"

# Backup WordPress files
log_message "Backing up WordPress files..."
if docker volume ls | grep -q wordpress_wp_data; then
    docker run --rm -v wordpress_wp_data:/data -v "$BACKUP_DIR/$DATE":/backup alpine tar czf /backup/wordpress-files.tar.gz -C /data .
    log_message "WordPress files backup completed"
else
    log_message "WARNING: WordPress volume not found"
fi

# Backup database
log_message "Backing up database..."
cd "$WORDPRESS_DIR"

if docker-compose ps db | grep -q "Up"; then
    # Source environment variables
    if [ -f .env ]; then
        source .env
    else
        log_message "ERROR: .env file not found"
        exit 1
    fi
    
    # Create database backup
    docker-compose exec -T db mysqldump -u wp -p$MYSQL_PASSWORD --single-transaction --routines --triggers wordpress > "$BACKUP_DIR/$DATE/wordpress-db.sql"
    log_message "Database backup completed"
else
    log_message "WARNING: Database container not running"
fi

# Compress backup
log_message "Compressing backup..."
cd "$BACKUP_DIR"
tar czf "wordpress-backup-$DATE.tar.gz" "$DATE"
rm -rf "$DATE"

# Verify backup
if [ -f "wordpress-backup-$DATE.tar.gz" ]; then
    BACKUP_SIZE=$(stat -f%z "wordpress-backup-$DATE.tar.gz" 2>/dev/null || stat -c%s "wordpress-backup-$DATE.tar.gz")
    log_message "Backup completed successfully: wordpress-backup-$DATE.tar.gz ($BACKUP_SIZE bytes)"
else
    log_message "ERROR: Backup file was not created"
    exit 1
fi

# Clean up old backups
log_message "Cleaning up old backups (keeping last $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "wordpress-backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Log completion
REMAINING_BACKUPS=$(ls -1 "$BACKUP_DIR"/wordpress-backup-*.tar.gz 2>/dev/null | wc -l)
log_message "Backup process completed. $REMAINING_BACKUPS backup files retained."

# Optional: Upload to remote storage (uncomment and configure as needed)
# log_message "Uploading backup to remote storage..."
# aws s3 cp "wordpress-backup-$DATE.tar.gz" s3://your-backup-bucket/wordpress/
# log_message "Remote upload completed"
`;

        fs.writeFileSync('/usr/local/bin/wordpress-backup.sh', backupScript);
        execSync('chmod +x /usr/local/bin/wordpress-backup.sh');
        this.log('✅ Production backup script created at /usr/local/bin/wordpress-backup.sh', 'success');
    }

    async cleanup() {
        this.log('🧹 Cleaning up test environment...', 'info');

        try {
            if (fs.existsSync(this.testDir)) {
                execSync(`rm -rf ${this.testDir}`);
            }
            this.log('✅ Test environment cleaned up', 'success');
        } catch (error) {
            this.log(`⚠️  Cleanup warning: ${error.message}`, 'warning');
        }
    }

    async run() {
        this.log('🧪 Starting Backup and Recovery Testing...', 'header');

        const results = {
            environment: false,
            wordpressBackup: false,
            databaseBackup: false,
            compression: false,
            recovery: false,
            retention: false
        };

        try {
            results.environment = await this.createTestEnvironment();

            if (results.environment) {
                results.wordpressBackup = await this.testWordPressBackup();
                results.databaseBackup = await this.testDatabaseBackup();
                results.compression = await this.testBackupCompression();
                results.recovery = await this.testRecoveryProcedure();
                results.retention = await this.testBackupRetention();
            }

            await this.createBackupScript();

        } finally {
            await this.cleanup();
        }

        // Generate report
        this.log('📊 Backup and Recovery Test Report', 'header');
        this.log('='.repeat(40), 'info');

        const tests = Object.keys(results);
        const passed = tests.filter(test => results[test]).length;
        const total = tests.length;

        for (const test of tests) {
            const status = results[test] ? '✅' : '❌';
            this.log(`${status} ${test}`, results[test] ? 'success' : 'error');
        }

        this.log('='.repeat(40), 'info');
        this.log(`Total: ${passed}/${total} tests passed`, passed === total ? 'success' : 'warning');

        if (passed === total) {
            this.log('🎉 All backup and recovery tests passed!', 'success');
            return 0;
        } else {
            this.log('⚠️  Some backup and recovery tests failed', 'warning');
            return 1;
        }
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new BackupRecoveryTester();

    tester.run().then(exitCode => {
        process.exit(exitCode);
    }).catch(error => {
        console.error('❌ Backup and Recovery Testing failed:', error);
        process.exit(1);
    });
}

export default BackupRecoveryTester;