#!/bin/bash

# ⚠️ SECURITY: API key must be set as environment variable
# Set with: export GOOGLE_GEMINI_API_KEY="your_key_here"
if [ -z "$GOOGLE_GEMINI_API_KEY" ]; then
    echo "ERROR: GOOGLE_GEMINI_API_KEY environment variable not set"
    echo "Please set it with: export GOOGLE_GEMINI_API_KEY=\"your_key_here\""
    exit 1
fi

API_KEY="$GOOGLE_GEMINI_API_KEY"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="public/Blog/capa-retinopatia-diabetica-${TIMESTAMP}.png"

PROMPT="A professional medical illustration of diabetic retinopathy. The image shows an eye cross-section with detailed retinal blood vessel damage including microaneurysms and hemorrhages. Soft blue and red medical color scheme. Subtle glucose molecules in the background representing diabetes. Bold text overlay 'Retinopatia Diabética' in modern sans-serif font. Smaller subtitle 'Controle e Prevenção'. Clean educational medical infographic style. Professional healthcare aesthetic with high contrast. 16:9 landscape format. Modern medical illustration, informative, professional, high-quality healthcare graphics."

curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"instances\": [{
      \"prompt\": \"${PROMPT}\"
    }],
    \"parameters\": {
      \"sampleCount\": 1,
      \"aspectRatio\": \"16:9\"
    }
  }" > /tmp/imagen_response.json

python3 << PYEOF
import json, base64

with open('/tmp/imagen_response.json', 'r') as f:
    data = json.load(f)

if 'predictions' in data and len(data['predictions']) > 0:
    img_b64 = data['predictions'][0].get('bytesBase64Encoded', '')
    if img_b64:
        img_data = base64.b64decode(img_b64)
        with open('${OUTPUT_FILE}', 'wb') as f:
            f.write(img_data)
        print('SUCCESS:${OUTPUT_FILE}')
    else:
        print('ERROR: No image data')
        print(json.dumps(data, indent=2))
else:
    print('ERROR: Invalid response')
    print(json.dumps(data, indent=2))
PYEOF
