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
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
    except Exception as e:
        print(f"❌ Error initializing Gemini: {e}")
        return False

    # Generate timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Prompt for dry eye syndrome podcast cover
    prompt = """
Create a professional podcast cover image for "Olho Seco" (Dry Eye Syndrome) medical podcast.

Style requirements:
- Clean, modern medical podcast design
- Blue and white color scheme (representing hydration and eye health)
- Central focus: a stylized eye with blue water drop elements
- Medical cross symbols subtly integrated
- Professional healthcare aesthetic
- 512x512 pixels, square format
- Include text "Olho Seco" in elegant, readable medical font
- Add subtitle "Sintomas e Tratamentos" in smaller font
- Background: soft gradient from light blue to white
- Medical podcast thumbnail style suitable for Spotify/Apple Podcasts

The design should be:
- Professional and trustworthy
- Medically accurate but approachable
- Calming and soothing (blue tones)
- High contrast for readability
- Modern healthcare branding
"""

    print("🎙️ Generating podcast cover for Olho Seco episode...")
    print(f"📁 Output directory: {OUTPUT_DIR}")

    try:
        # Generate content
        response = model.generate_content(prompt)

        if response.text:
            # Save the response as a text file with the prompt details
            output_file = OUTPUT_DIR / f"olho_seco_cover_{timestamp}.txt"

            content = f"""SARAIVA VISION - PODCAST COVER GENERATION
============================================
Episode: Olho Seco - Sintomas e Tratamentos
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Model: gemini-2.0-flash-exp

PROMPT:
{prompt}

RESPONSE:
{response.text}

============================================
Note: This is a text-based response. For actual image generation,
please use the Imagen API or another image generation service.
"""

            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(content)

            print(f"✅ Cover concept saved as: {output_file}")
            print(f"📄 File size: {output_file.stat().st_size} bytes")

            return True
        else:
            print("❌ No response received from Gemini")
            return False

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
        print("\n📝 Note: This script generated a design concept.")
        print("🎨 For actual image generation, use:")
        print("\n✅ Podcast cover generation completed successfully!")
        print("\n📝 Note: This script generated a design concept.")
        print("🎨 For actual image generation, use:")
        print("   - Imagen API (generate-podcast-cover-olho-seco-imagen.py)")
        print("   - DALL-E, Midjourney, or similar service")
        print("   - Professional designer")
        print("   - DALL-E, Midjourney, or similar service")
        print("   - Professional designer")
    else:
        print("\n❌ Failed to generate podcast cover")
        sys.exit(1)

if __name__ == "__main__":
    main()