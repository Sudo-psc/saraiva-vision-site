#!/bin/bash

API_KEY="AIzaSyDpN-4P56jJu-PJuBufaM4tor7o1j-wjO0"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="public/Blog/capa-retinopatia-diabetica-${TIMESTAMP}.png"

PROMPT="Professional medical illustration of diabetic retinopathy showing an eye cross-section. Features detailed retinal blood vessel damage with microaneurysms and hemorrhages in soft blue and red medical tones. Subtle glucose molecules in background. Bold text 'Retinopatia Diabética' in modern sans-serif font with subtitle 'Controle e Prevenção'. Clean educational medical infographic style. High contrast professional healthcare aesthetic. 16:9 landscape format."

curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:generateImages?key=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "'"${PROMPT}"'",
    "config": {
      "numberOfImages": 1,
      "aspectRatio": "16:9"
    }
  }' > /tmp/imagen_response.json

python3 << 'PYEOF'
import json, base64

try:
    with open('/tmp/imagen_response.json', 'r') as f:
        data = json.load(f)
    
    if 'generatedImages' in data and len(data['generatedImages']) > 0:
        img_b64 = data['generatedImages'][0].get('imageBytes', '')
        if img_b64:
            img_data = base64.b64decode(img_b64)
            with open('public/Blog/capa-retinopatia-diabetica.png', 'wb') as f:
                f.write(img_data)
            print('SUCCESS:public/Blog/capa-retinopatia-diabetica.png')
        else:
            print('ERROR: No image bytes')
            print(json.dumps(data, indent=2))
    else:
        print('ERROR: Invalid response structure')
        print(json.dumps(data, indent=2))
except Exception as e:
    print(f'ERROR: {str(e)}')
    with open('/tmp/imagen_response.json', 'r') as f:
        print(f.read())
PYEOF
