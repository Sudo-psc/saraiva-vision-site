#!/usr/bin/env python3
"""
Generate Priority Blog Covers using Gemini 2.5 Flash
Saraiva Vision - 4 Priority Covers
"""
import os
import sys
from pathlib import Path
from google import genai
from google.genai import types

# Configure API
API_KEY = os.environ.get('GOOGLE_GEMINI_API_KEY')
if not API_KEY:
    print("❌ GOOGLE_GEMINI_API_KEY not found in environment")
    sys.exit(1)

# Output directory
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "Blog"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Priority images to generate
PRIORITY_COVERS = [
    {
        "filename": "capa-moscas-volantes.png",
        "title": "Moscas Volantes",
        "prompt": """Generate an image in 16:9 widescreen landscape format.

A medical illustration showing eye vitreous floaters. The scene depicts a microscopic view inside the human eye, showing translucent strands and small particles floating in the clear vitreous gel. Use a clean, educational medical aesthetic with soft blue and white tones.

VISUAL ELEMENTS:
- Microscopic floating particles and strands
- Transparent vitreous gel with light refractions
- Professional medical illustration style
- Clean blue and white color scheme
- Abstract symbolic representation

TECHNICAL REQUIREMENTS:
- 16:9 landscape widescreen format
- High quality professional medical imagery
- NO text, NO words, NO letters in the image
- Soft professional lighting
- Modern clean medical aesthetic
- Abstract symbolic representation

Generate the visual image now."""
    },
    {
        "filename": "capa-descolamento-retina.png",
        "title": "Descolamento de Retina",
        "prompt": """Generate an image in 16:9 widescreen landscape format.

A medical cross-section illustration of a detached retina. Show an anatomical diagram depicting retinal separation from the underlying tissue layers. Use professional medical colors with blue and red tones to show anatomical structures clearly.

VISUAL ELEMENTS:
- Cross-section of eye showing retinal layers
- Clear visualization of retinal detachment
- Professional medical diagram style
- Blue and red medical color scheme
- Educational anatomical accuracy

TECHNICAL REQUIREMENTS:
- 16:9 landscape widescreen format
- High quality medical illustration
- NO text, NO words, NO letters in the image
- Professional medical lighting
- Modern anatomical diagram aesthetic
- Clear anatomical structure representation

Generate the visual image now."""
    },
    {
        "filename": "capa-teste-olhinho.png",
        "title": "Teste do Olhinho",
        "prompt": """Generate an image in 16:9 widescreen landscape format.

A warm medical scene showing a newborn baby eye examination. A pediatric ophthalmologist is gently performing the red reflex test using a handheld ophthalmoscope. The scene conveys gentle medical care in a warm hospital setting with soft lighting.

VISUAL ELEMENTS:
- Newborn baby in gentle medical examination
- Ophthalmoscope instrument (handheld medical device)
- Warm hospital lighting
- Compassionate healthcare atmosphere
- Soft focus on medical care moment

TECHNICAL REQUIREMENTS:
- 16:9 landscape widescreen format
- Professional healthcare photography style
- NO text, NO words, NO letters in the image
- Warm soft lighting
- Gentle compassionate medical aesthetic
- Focus on the caring medical moment

Generate the visual image now."""
    },
    {
        "filename": "capa-retinose-pigmentar.png",
        "title": "Retinose Pigmentar",
        "prompt": """Generate an image in 16:9 widescreen format.

A fundus photograph showing retinitis pigmentosa. Display a retinal imaging view with characteristic bone spicule pigmentation pattern visible in the retinal structure. Use professional medical retinal imaging colors showing detailed retinal degeneration.

VISUAL ELEMENTS:
- Retinal fundus photograph view
- Bone spicule pigmentation pattern
- Professional retinal imaging colors
- Detailed retinal structure visualization
- Medical diagnostic imaging style

TECHNICAL REQUIREMENTS:
- 16:9 landscape widescreen format
- Professional medical retinal imaging
- NO text, NO words, NO letters in the image
- Medical imaging lighting
- Diagnostic visualization aesthetic
- Clear retinal detail representation

Generate the visual image now."""
    }
]

def generate_cover(cover_data: dict, client: genai.Client) -> bool:
    """Generate a single cover image"""
    filename = cover_data['filename']
    output_path = OUTPUT_DIR / filename
    
    # Skip if exists
    if output_path.exists():
        print(f"⏭️  Skipped: {filename} (already exists)")
        return True
    
    print(f"\n🎨 Generating: {filename}")
    print(f"📝 Title: {cover_data['title']}")
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=cover_data['prompt'],
            config=types.GenerateContentConfig(
                temperature=0.6,
                max_output_tokens=8192
            )
        )
        
        # Check if response has image
        if hasattr(response, 'parts'):
            for part in response.parts:
                if hasattr(part, 'inline_data'):
                    # Save image
                    with open(output_path, 'wb') as f:
                        f.write(part.inline_data.data)
                    
                    print(f"✅ Saved: {output_path}")
                    return True
        
        print(f"⚠️  No image generated for {filename}")
        print(f"Response: {response.text[:200] if hasattr(response, 'text') else 'No text'}")
        return False
        
    except Exception as e:
        print(f"❌ Error generating {filename}: {str(e)}")
        return False

def main():
    print("=" * 70)
    print("🖼️  PRIORITY BLOG COVERS GENERATOR - Gemini 2.5 Flash")
    print("=" * 70)
    print(f"Output: {OUTPUT_DIR}")
    print(f"Images to generate: {len(PRIORITY_COVERS)}")
    print("")
    
    # Initialize Gemini client
    client = genai.Client(api_key=API_KEY)
    
    success = 0
    failed = 0
    skipped = 0
    
    for i, cover in enumerate(PRIORITY_COVERS, 1):
        print(f"\n[{i}/{len(PRIORITY_COVERS)}] Processing: {cover['filename']}")
        
        if (OUTPUT_DIR / cover['filename']).exists():
            skipped += 1
            print(f"⏭️  Already exists")
            continue
        
        if generate_cover(cover, client):
            success += 1
        else:
            failed += 1
    
    print("\n" + "=" * 70)
    print("📊 SUMMARY")
    print("=" * 70)
    print(f"✅ Success: {success}")
    print(f"⏭️  Skipped: {skipped}")
    print(f"❌ Failed: {failed}")
    print(f"📁 Output: {OUTPUT_DIR}")
    print("=" * 70)
    
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
