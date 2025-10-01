#!/bin/bash

# Simple wrapper to generate blog covers with Gemini
# Usage: ./generate-covers-simple.sh [post-id]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Check for API key
if [ -z "$GOOGLE_GEMINI_API_KEY" ] && [ -z "$GOOGLE_API_KEY" ]; then
    echo "❌ Error: No Google API key found"
    echo ""
    echo "Please set one of:"
    echo "  export GOOGLE_GEMINI_API_KEY='your-key'"
    echo "  export GOOGLE_API_KEY='your-key'"
    echo ""
    echo "Get your API key from: https://aistudio.google.com/apikey"
    exit 1
fi

# Use GOOGLE_GEMINI_API_KEY if set, otherwise use GOOGLE_API_KEY
API_KEY="${GOOGLE_GEMINI_API_KEY:-$GOOGLE_API_KEY}"

# Activate venv and run script
if [ ! -d ".venv" ]; then
    echo "🔧 Creating virtual environment..."
    python3 -m venv .venv
    .venv/bin/pip install -q google-genai pillow
fi

export GOOGLE_GEMINI_API_KEY="$API_KEY"

echo "🎨 Gemini Cover Generator"
echo "========================="
echo ""

# Run the generator with arguments
.venv/bin/python scripts/generate_covers_gemini_flash.py "$@"
