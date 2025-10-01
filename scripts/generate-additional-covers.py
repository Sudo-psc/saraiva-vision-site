#!/usr/bin/env python3
"""
Generate Additional Blog Covers using Imagen 4
Saraiva Vision - Additional specific covers for posts with generic images
"""
import os
import sys
import time
from pathlib import Path
from PIL import Image
from io import BytesIO
from google import genai

# Configure API
API_KEY = os.environ.get('GOOGLE_GEMINI_API_KEY')
if not API_KEY:
    print("❌ GOOGLE_GEMINI_API_KEY not found in environment")
    sys.exit(1)

# Output directory
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "Blog"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Additional covers to generate (posts with generic images)
ADDITIONAL_COVERS = [
    {
        "filename": "capa-amaurose-congenita-leber.png",
        "title": "Amaurose Congênita de Leber: Tratamento e Terapia Gênica",
        "prompt": """Generate an image in 16:9 widescreen landscape format.

A sophisticated medical illustration showing genetic therapy for retinal disease. Depict a microscopic view of retinal cells with DNA helix and gene therapy vectors. Use modern scientific visualization with blue and purple tones representing innovative genetic treatment.

VISUAL ELEMENTS:
- Microscopic retinal cell structure
- DNA helix and genetic elements
- Gene therapy vectors (subtle medical particles)
- Modern scientific illustration style
- Blue and purple color scheme with medical precision

TECHNICAL REQUIREMENTS:
- 16:9 landscape widescreen format
- High quality scientific medical imagery
- NO text, NO words, NO letters in the image
- Professional scientific lighting
- Modern genetic therapy visualization
- Clean, innovative medical aesthetic

Generate the visual image now."""
    },
    {
        "filename": "capa-cuidados-visuais-esportes.png",
        "title": "Cuidados Visuais em Esportes",
        "prompt": """Generate an image in 16:9 widescreen landscape format.

A dynamic sports scene showing athletes wearing protective eyewear. Show various sports activities with athletes using modern sports glasses and protective equipment. Use action-oriented lighting with vibrant colors showing movement and protection.

VISUAL ELEMENTS:
- Athletes in action wearing sports glasses/protective eyewear
- Dynamic movement and sports activities
- Modern sports equipment and protective gear
- Action-oriented composition
- Vibrant energetic color scheme

TECHNICAL REQUIREMENTS:
- 16:9 landscape widescreen format
- High quality sports photography style
- NO text, NO words, NO letters in the image
- Dynamic action lighting
- Modern athletic aesthetic
- Focus on protective eyewear and movement

Generate the visual image now."""
    },
    {
        "filename": "capa-lentes-daltonismo.png",
        "title": "Lentes Especiais para Daltonismo",
        "prompt": """Generate an image in 16:9 widescreen landscape format.

An artistic visualization showing color perception enhancement. Display a split-view showing normal color vision versus colorblind vision, with special lenses in between. Use color spectrum elements and prism effects to show color enhancement technology.

VISUAL ELEMENTS:
- Split-view comparison of color perception
- Special colored lenses/tints in center
- Color spectrum and rainbow elements
- Prism light refraction effects
- Vibrant color palette demonstration

TECHNICAL REQUIREMENTS:
- 16:9 landscape widescreen format
- High quality optical visualization
- NO text, NO words, NO letters in the image
- Colorful prism lighting effects
- Modern optical technology aesthetic
- Clear color enhancement demonstration

Generate the visual image now."""
    },
    {
        "filename": "capa-estrabismo-tratamento.png",
        "title": "Estrabismo: Quando Desconfiar e Procurar Oftalmologista",
        "prompt": """Generate an image in 16:9 widescreen landscape format.

A medical illustration showing eye alignment and strabismus treatment. Display anatomical eye diagrams showing proper eye alignment versus misalignment. Use clean medical illustration style with focus on eye muscle coordination and alignment.

VISUAL ELEMENTS:
- Anatomical eye alignment diagrams
- Eye muscle structure visualization
- Before/after treatment comparison (subtle)
- Clean medical illustration style
- Professional anatomical accuracy

TECHNICAL REQUIREMENTS:
- 16:9 landscape widescreen format
- Professional medical illustration
- NO text, NO words, NO letters in the image
- Clean medical lighting
- Anatomical precision
- Educational medical diagram style

Generate the visual image now."""
    },
    {
        "filename": "capa-alimentacao-microbioma-ocular.png",
        "title": "Alimentação, Microbioma Ocular e Saúde da Visão",
        "prompt": """Generate an image in 16:9 widescreen landscape format.

A wellness visualization showing nutrition and eye health. Display fresh colorful fruits, vegetables, and omega-3 rich foods arranged around a central eye symbol. Use natural lighting with vibrant food colors and green elements representing health and nutrition.

VISUAL ELEMENTS:
- Fresh colorful fruits and vegetables
- Omega-3 rich foods (fish, nuts, seeds)
- Central eye health symbol
- Natural, organic composition
- Vibrant fresh food colors

TECHNICAL REQUIREMENTS:
- 16:9 landscape widescreen format
- High quality food photography style
- NO text, NO words, NO letters in the image
- Natural daylight lighting
- Fresh, healthy aesthetic
- Focus on nutritious eye-healthy foods

Generate the visual image now."""
    },
    {
        "filename": "capa-sensibilidade-luz-fotofobia.png",
        "title": "Sensibilidade à Luz: Causas e Tratamentos",
        "prompt": """Generate an image in 16:9 widescreen landscape format.

A conceptual image showing light sensitivity and photophobia. Display a person shielding eyes from intense light, with artistic light rays and lens flare effects. Use dramatic lighting contrast between bright light and shadow areas.

VISUAL ELEMENTS:
- Person reacting to bright light
- Intense light rays and lens flares
- High contrast between light and shadow
- Dramatic lighting effects
- Protective gesture elements

TECHNICAL REQUIREMENTS:
- 16:9 landscape widescreen format
- High quality conceptual photography
- NO text, NO words, NO letters in the image
- Dramatic high-contrast lighting
- Professional photography aesthetic
- Clear light sensitivity representation

Generate the visual image now."""
    },
    {
        "filename": "capa-lentes-contato-tipos.png",
        "title": "Lentes de Contato: Rígidas vs Gelatinosas",
        "prompt": """Generate an image in 16:9 widescreen landscape format.

A product photography shot showing different types of contact lenses. Display rigid gas permeable lenses and soft hydrogel lenses side by side with lens cases and solution bottles. Use clean, clinical lighting with white and blue tones.

VISUAL ELEMENTS:
- Rigid gas permeable contact lenses
- Soft hydrogel contact lenses
- Lens cases and cleaning solution
- Clean clinical composition
- Professional medical product style

TECHNICAL REQUIREMENTS:
- 16:9 landscape widescreen format
- High quality product photography
- NO text, NO words, NO letters in the image
- Clean clinical lighting
- Medical product aesthetic
- Sharp focus on lens details

Generate the visual image now."""
    }
]

def generate_cover(cover_data: dict, client: genai.Client, max_retries: int = 3) -> bool:
    """Generate a single cover image"""
    filename = cover_data['filename']
    output_path = OUTPUT_DIR / filename

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
                prompt=cover_data['prompt'],
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
    print("🎨 Imagen 4 - Additional Blog Covers Generator")
    print("   Saraiva Vision Blog")
    print("=" * 70)
    print(f"\n🔑 API Key: {'✅ Configured' if API_KEY else '❌ Missing'}")
    print(f"📁 Output: {OUTPUT_DIR}")
    print(f"🖼️  Images to generate: {len(ADDITIONAL_COVERS)}")

    if not API_KEY:
        print("\n❌ Error: GOOGLE_GEMINI_API_KEY not set")
        return 1

    # Initialize Gemini client
    client = genai.Client(api_key=API_KEY)

    success = 0
    failed = 0

    for config in ADDITIONAL_COVERS:
        print(f"\n🎨 Processing: {config['filename']}")
        print(f"📝 Title: {config['title']}")

        if generate_cover(config, client):
            success += 1
        else:
            failed += 1

        # Rate limiting between requests
        if config != ADDITIONAL_COVERS[-1]:
            print("\n⏳ Waiting 3s (rate limit)...")
            time.sleep(3)

    # Summary
    print(f"\n{'=' * 70}")
    print(f"📊 Generation Summary")
    print("=" * 70)
    print(f"✅ Success: {success}")
    print(f"❌ Failed: {failed}")
    print(f"📁 Output: {OUTPUT_DIR}")

    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())