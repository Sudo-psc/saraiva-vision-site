#!/bin/bash

# Script to generate cover images for blog posts using Google's Imagen 4.0 API
# Requires: gcloud CLI authenticated, jq for JSON parsing

# Configuration
PROJECT_ID="your-project-id"  # Replace with your Google Cloud project ID
LOCATION="us-central1"         # Replace with your preferred region (e.g., us-central1, europe-west2)
MODEL_VERSION="imagen-4.0-generate-001"  # Latest model as of 2025-09-29
OUTPUT_DIR="blog_covers"
PROMPTS_FILE="prompts.txt"     # File containing one prompt per line

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Check if prompts file exists
if [[ ! -f "$PROMPTS_FILE" ]]; then
    echo "Error: $PROMPTS_FILE not found. Create a file with one text prompt per line."
    exit 1
fi

# Function to generate an image from a prompt
generate_image() {
    local PROMPT="$1"
    local FILENAME=$(echo "$PROMPT" | tr ' ' '_' | tr -cd '[:alnum:]_-' | cut -c1-50).png  # Sanitize filename

    # Create request JSON
    cat > request.json <<EOF
{
  "instances": [
    {
      "prompt": "$PROMPT"
    }
  ],
  "parameters": {
    "sampleCount": 1,
    "aspectRatio": "16:9",
    "outputOptions": {
      "mimeType": "image/png"
    }
  }
}
EOF

    echo "Generating image for prompt: $PROMPT"

    # Make API call using bearer token from gcloud
    RESPONSE=$(curl -s -X POST \
        -H "Authorization: Bearer $(gcloud auth print-access-token)" \
        -H "Content-Type: application/json; charset=utf-8" \
        -d @request.json \
        "https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_VERSION}:predict")

    # Check for errors in response
    if echo "$RESPONSE" | jq -e '.error' > /dev/null; then
        echo "Error in API response: $(echo "$RESPONSE" | jq -r '.error.message')"
        return 1
    fi

    # Extract base64 image data
    BASE64_IMG=$(echo "$RESPONSE" | jq -r '.predictions[0].bytesBase64Encoded')

    if [[ "$BASE64_IMG" == "null" || -z "$BASE64_IMG" ]]; then
        echo "No image data received for prompt: $PROMPT"
        return 1
    fi

    # Decode and save image
    echo "$BASE64_IMG" | base64 -d > "${OUTPUT_DIR}/${FILENAME}"

    if [[ $? -eq 0 ]]; then
        echo "Saved image to ${OUTPUT_DIR}/${FILENAME}"
    else
        echo "Failed to save image for prompt: $PROMPT"
    fi

    # Clean up
    rm -f request.json
}

# Read prompts from file and generate images
while IFS= read -r PROMPT; do
    # Skip empty lines
    [[ -z "$PROMPT" ]] && continue

    generate_image "$PROMPT"
    sleep 2  # Rate limiting: avoid hitting API limits
done < "$PROMPTS_FILE"

echo "Image generation complete. Check the $OUTPUT_DIR directory."