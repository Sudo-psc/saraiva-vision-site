#!/bin/bash

# Nginx Configuration Audit Script
# Reviews all nginx config files and identifies conflicts

echo "🔍 NGINX CONFIGURATION AUDIT"
echo "============================================="
echo

# Find all .conf files
CONF_FILES=$(find . -name "*.conf" -type f | grep -E "(nginx|security)" | sort)

echo "📁 Found configuration files:"
echo "$CONF_FILES"
echo
echo "============================================="
echo

# Analyze each configuration file
for file in $CONF_FILES; do
    if [[ -f "$file" ]]; then
        echo "📄 Analyzing: $file"
        echo "   Size: $(wc -c < "$file") bytes"
        echo "   Lines: $(wc -l < "$file") lines"
        
        # Check for common directives
        if grep -q "server {" "$file"; then
            echo "   ✓ Contains server block"
        fi
        
        if grep -q "listen" "$file"; then
            echo "   🔌 Listen directive found"
            grep "listen" "$file" | sed 's/^/      /'
        fi
        
        if grep -q "server_name" "$file"; then
            echo "   🌐 Server name found"
            grep "server_name" "$file" | sed 's/^/      /'
        fi
        
        if grep -q "location" "$file"; then
            echo "   📍 Location blocks found"
            grep "location" "$file" | wc -l | sed 's/^/      Count: /'
        fi
        
        echo
    fi
done

echo "============================================="
echo

# Check for port conflicts
echo "🔌 PORT CONFLICT ANALYSIS"
echo "Checking for duplicate listen directives..."
echo

ALL_LISTEN=$(grep -h "listen" $CONF_FILES 2>/dev/null | sort | uniq -c | sort -rn)
if [[ -n "$ALL_LISTEN" ]]; then
    echo "$ALL_LISTEN"
else
    echo "   No listen directives found"
fi

echo
echo "============================================="
echo

# Check for server_name conflicts
echo "🌐 SERVER NAME CONFLICT ANALYSIS"
echo "Checking for duplicate server_name directives..."
echo

ALL_SERVERS=$(grep -h "server_name" $CONF_FILES 2>/dev/null | sort | uniq -c | sort -rn)
if [[ -n "$ALL_SERVERS" ]]; then
    echo "$ALL_SERVERS"
else
    echo "   No server_name directives found"
fi

echo
echo "============================================="
echo "🎯 RECOMMENDATIONS"
echo
echo "1. Consolidate similar configurations"
echo "2. Remove unused/duplicate files"
echo "3. Standardize naming convention"
echo "4. Create organized structure with includes"
echo
echo "✅ Audit completed!"