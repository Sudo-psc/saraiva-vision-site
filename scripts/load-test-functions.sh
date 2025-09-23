#!/bin/bash

# Serverless Function Load Testing Script
# Tests concurrent requests to validate function performance under load

DOMAIN="${1:-${LOAD_TEST_DOMAIN:-YOUR_DOMAIN_HERE}}"

if [ "$DOMAIN" = "YOUR_DOMAIN_HERE" ]; then
    echo "Error: Please provide domain as argument or set LOAD_TEST_DOMAIN environment variable"
    exit 1
fi
CONCURRENT_REQUESTS=10
TEST_DURATION=30

echo "🚀 Starting load test for $CONCURRENT_REQUESTS concurrent requests over ${TEST_DURATION}s"

# Test critical endpoints
ENDPOINTS=(
    "GET /api/health"
    "GET /api/ping" 
    "GET /api/appointments/availability"
    "GET /api/podcast/episodes"
)

# Function to test single endpoint
test_endpoint() {
    local method=$1
    local path=$2
    local url="https://$DOMAIN$path"
    
    echo "Testing $method $path..."
    
    # Run concurrent requests
    for i in $(seq 1 $CONCURRENT_REQUESTS); do
        (
            start_time=$(date +%s.%N)
            if [ "$method" = "GET" ]; then
                response=$(curl -s -w "%{http_code}" -o /dev/null "$url")
            else
                response=$(curl -s -w "%{http_code}" -o /dev/null -X "$method" "$url")
            fi
            end_time=$(date +%s.%N)
            duration=$(echo "$end_time - $start_time" | bc)
            echo "Request $i: ${duration}s (Status: $response)"
        ) &
    done
    
    # Wait for all background jobs to complete
    wait
    echo "Completed testing $method $path"
    echo "---"
}

# Run tests for each endpoint
for endpoint in "${ENDPOINTS[@]}"; do
    method=$(echo $endpoint | cut -d' ' -f1)
    path=$(echo $endpoint | cut -d' ' -f2)
    test_endpoint "$method" "$path"
    sleep 2
done

echo "✅ Load testing completed!"
echo "Review the response times and status codes above."
echo "Expected response times:"
echo "- /api/health: <1s"
echo "- /api/ping: <0.5s"
echo "- /api/appointments/availability: <2s"
echo "- /api/podcast/episodes: <1.5s"
