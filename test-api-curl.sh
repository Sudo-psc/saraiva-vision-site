#!/bin/bash

# API Testing Script for Saraiva Vision VPS Backend

VPS_IP="31.97.129.78"
API_PORT="3001"
API_BASE_URL="http://${VPS_IP}:${API_PORT}"

echo "🔍 Saraiva Vision API Testing"
echo "=================================="
echo "📍 VPS IP: $VPS_IP"
echo "🌐 API URL: $API_BASE_URL"
echo ""

# Test health endpoint
echo "🏥 Testing Health Endpoint..."
curl -s -w "Status: %{http_code}\n" "$API_BASE_URL/api/health" | head -5
echo ""

# Test services endpoint
echo "📋 Testing Services Endpoint..."
curl -s -w "Status: %{http_code}\n" "$API_BASE_URL/api/servicos" | head -10
echo ""

# Test specific service
echo "🎯 Testing Specific Service..."
curl -s -w "Status: %{http_code}\n" "$API_BASE_URL/api/servicos/consultas-oftalmologicas" | head -5
echo ""

echo "✅ Testing Complete"