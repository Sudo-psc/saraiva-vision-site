#!/usr/bin/env python3
"""
Generate unique cover images for posts with duplicate covers
Uses Gemini Imagen 4 API - optimized for photorealistic medical images
"""

import os
import sys
import time
from pathlib import Path
from google import genai
from PIL import Image
from io import BytesIO

# Configuration
# ⚠️ SECURITY: API key MUST be set as environment variable - NO FALLBACK!
# Set with: export GOOGLE_GEMINI_API_KEY="your_key_here"
API_KEY = os.environ.get('GOOGLE_GEMINI_API_KEY')
if not API_KEY:
    raise ValueError(
        "ERROR: GOOGLE_GEMINI_API_KEY environment variable not set.\n"
        "Please set it with: export GOOGLE_GEMINI_API_KEY='your_key_here'"
    )
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "Blog"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Configure client
client = genai.Client(api_key=API_KEY)

# Images to generate
COVERS_TO_GENERATE = [
    {
        'id': 17,
        'title': 'Cuidados Visuais em Esportes',
        'filename': 'capa-cuidados-visuais-esportes.png',
        'prompt': '''A professional medical photograph showing an athlete wearing protective sports eyewear during physical activity.

Photography style: Clean, modern medical photography with professional studio lighting
Subject: Athletic person in motion wearing high-quality sports goggles or protective eyewear
Setting: Dynamic sports environment (running track, gym, or outdoor sports field)
Color scheme: Energetic blues (#3B82F6) and vibrant greens (#10B981) with white accents
Composition: Rule of thirds, subject in action with emphasis on eye protection
Elements: Clear view of protective eyewear, athletic movement, health-focused
Mood: Active, protective, professional medical care
Camera: Shot with 85mm lens, f/2.8, natural lighting with soft fill
Quality: High-resolution, magazine-quality sports medicine photography
Aspect ratio: 16:9 landscape format
Note: NO text, words, or typography in the image'''
    },
    {
        'id': 7,
        'title': 'Sensibilidade à Luz (Fotofobia)',
        'filename': 'capa-sensibilidade-luz-fotofobia.png',
        'prompt': '''A professional medical photograph showing a person experiencing light sensitivity (photophobia).

Photography style: Clean medical photography with dramatic lighting contrast
Subject: Person shielding eyes from bright light, showing discomfort but in a clinical way
Setting: Bright environment with strong natural sunlight or bright clinical lighting
Color scheme: Bright warm yellows (#FBBF24) and whites contrasting with cool blues (#3B82F6)
Composition: Centered composition with light rays creating visual impact
Elements: Hand gesture shielding eyes, visible light sensitivity reaction, medical context
Mood: Protective, informative, empathetic medical care
Camera: Shot with 50mm lens, f/1.8, high-key lighting with controlled highlights
Quality: High-resolution, magazine-quality ophthalmology photography
Aspect ratio: 16:9 landscape format
Note: NO text, words, or typography in the image'''
    }
]

def generate_cover(config: dict, max_retries: int = 3) -> bool:
    """Generate a single cover image using Imagen 4"""

    print(f"\n{'─' * 70}")
    print(f"🎨 Generating: {config['title']}")
    print(f"   Output: {config['filename']}")
    print(f"{'─' * 70}")

    output_path = OUTPUT_DIR / config['filename']

    # Skip if exists
    if output_path.exists():
        print(f"⏭️  Already exists, skipping...")
        return True

    for attempt in range(max_retries):
        try:
            print(f"\n📸 Attempt {attempt + 1}/{max_retries}")
            print(f"   Model: imagen-4.0-generate-001")
            print(f"   Aspect: 16:9 landscape")

            # Generate image with Imagen 4
            response = client.models.generate_images(
                model='imagen-4.0-generate-001',
                prompt=config['prompt'],
                config={
                    'number_of_images': 1,
                    'aspect_ratio': '16:9',
                    'safety_filter_level': 'block_low_and_above',
                    'person_generation': 'allow_adult'
                }
            )

            if not response.generated_images:
                print(f"   ⚠️  No images in response")
                continue

            # Get image data
            image_data = response.generated_images[0]

            # Convert to PIL Image
            if hasattr(image_data, 'image'):
                # Handle different response formats
                img_bytes = image_data.image._pil_image if hasattr(image_data.image, '_pil_image') else image_data.image
            else:
                img_bytes = image_data._pil_image

            # Save as PNG
            if isinstance(img_bytes, Image.Image):
                img_bytes.save(output_path, 'PNG', optimize=True)
            else:
                # If bytes, convert first
                img = Image.open(BytesIO(img_bytes))
                img.save(output_path, 'PNG', optimize=True)

            # Verify saved
            if output_path.exists():
                size_mb = output_path.stat().st_size / (1024 * 1024)
                print(f"\n✅ Success!")
                print(f"   File: {output_path.name}")
                print(f"   Size: {size_mb:.2f} MB")
                return True

        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            if 'quota' in str(e).lower() or 'rate' in str(e).lower():
                wait_time = 10 * (attempt + 1)
                print(f"   ⏳ Rate limit - waiting {wait_time}s...")
                time.sleep(wait_time)
            elif attempt < max_retries - 1:
                wait_time = 3
                print(f"   ⏳ Retrying in {wait_time}s...")
                time.sleep(wait_time)

    print(f"\n❌ Failed after {max_retries} attempts")
    return False

def main():
    print("=" * 70)
    print("🎨 Gemini Imagen 4 - Unique Cover Generator")
    print("   Saraiva Vision Blog")
    print("=" * 70)
    print(f"\n🔑 API Key: {'✅ Configured' if API_KEY else '❌ Missing'}")
    print(f"📁 Output: {OUTPUT_DIR}")
    print(f"🖼️  Images to generate: {len(COVERS_TO_GENERATE)}")

    if not API_KEY:
        print("\n❌ Error: GOOGLE_GEMINI_API_KEY not set")
        return 1

    success = 0
    failed = 0

    for config in COVERS_TO_GENERATE:
        if generate_cover(config):
            success += 1
        else:
            failed += 1

        # Rate limiting between requests
        if config != COVERS_TO_GENERATE[-1]:
            print("\n⏳ Waiting 3s (rate limit)...")
            time.sleep(3)

    # Summary
    print(f"\n{'=' * 70}")
    print(f"📊 Generation Summary")
    print(f"{'=' * 70}")
    print(f"✅ Success: {success}/{len(COVERS_TO_GENERATE)}")
    print(f"❌ Failed: {failed}/{len(COVERS_TO_GENERATE)}")

    if success == len(COVERS_TO_GENERATE):
        print(f"\n🎉 All covers generated successfully!")
        print(f"\n📝 Next steps:")
        print(f"   1. Update post frontmatter")
        print(f"   2. Generate AVIF versions")
        print(f"   3. Deploy to production")
        return 0
    else:
        print(f"\n⚠️  Some covers failed - manual generation may be needed")
        return 1

if __name__ == '__main__':
    sys.exit(main())
