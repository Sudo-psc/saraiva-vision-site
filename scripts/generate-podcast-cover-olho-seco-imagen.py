#!/usr/bin/env python3
"""
Simple Podcast Cover Generator for Olho Seco Episode
Saraiva Vision - Medical Podcast Cover Generation
"""

import os
import sys
from datetime import datetime
from pathlib import Path
import google.generativeai as genai

# Configuration
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "Podcasts" / "Covers"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def generate_podcast_cover():
    """Generate a podcast cover for dry eye syndrome episode"""

    # Initialize Gemini
    api_key = os.getenv('GOOGLE_GEMINI_API_KEY')
    if not api_key:
        print("❌ GOOGLE_GEMINI_API_KEY environment variable not found")
        return False

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('imagen-3.0-generate-001')
    except Exception as e:
        print(f"❌ Error initializing Gemini: {e}")
        return False

    # Generate timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Prompt for dry eye syndrome podcast cover
    prompt = """
Podcast cover image for medical podcast about dry eye syndrome (Olho Seco). Professional, clean design with medical theme. Eye health concept with tear drop imagery. Blue and white color scheme with medical clinic aesthetic. Professional podcast thumbnail style, 512x512 pixels.
"""

    print("🎙️ Generating podcast cover for Olho Seco episode...")
    print(f"📁 Output directory: {OUTPUT_DIR}")

    try:
        # Generate content
        response = model.generate_images(
            prompt=prompt,
            number_of_images=1,
            safety_filter_level='block_some',
            person_generation='allow_adult',
            aspect_ratio='1:1'
        )

        for img in response.generated_images:
            # Save with timestamp
            filename = f"olho_seco_cover_{timestamp}.png"
            filepath = OUTPUT_DIR / filename

            img.save(filepath)

            file_size = filepath.stat().st_size
            print(f"✅ Cover saved as: {filename}")
            print(f"📏 File size: {file_size:,} bytes")
            print(f"📂 Full path: {filepath}")

            return True

    except Exception as e:
        print(f"❌ Error generating content: {e}")
        return False

def main():
    """Main function"""
    print("🏥 SARAIVA VISION - PODCAST COVER GENERATOR")
    print("=" * 50)
    print("📻 Episode: Olho Seco - Sintomas e Tratamentos")
    print("=" * 50)

    success = generate_podcast_cover()

    if success:
        print("\n✅ Podcast cover generation completed successfully!")
        print("🎨 New cover has been saved with timestamp")
    else:
        print("\n❌ Failed to generate podcast cover")
        sys.exit(1)

if __name__ == "__main__":
    main()