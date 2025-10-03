#!/bin/bash

API_KEY="AIzaSyDpN-4P56jJu-PJuBufaM4tor7o1j-wjO0"
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
