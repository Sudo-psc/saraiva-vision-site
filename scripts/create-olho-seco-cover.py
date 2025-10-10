#!/usr/bin/env python3
"""
Create Olho Seco Podcast Cover
Simple script to create a podcast cover using PIL
"""

from PIL import Image, ImageDraw, ImageFont
from datetime import datetime
from pathlib import Path

def create_podcast_cover():
    """Create a podcast cover for Olho Seco episode"""

    # Configuration
    OUTPUT_DIR = Path(__file__).parent.parent / "public" / "Podcasts" / "Covers"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Create a 512x512 image
    width, height = 512, 512
    image = Image.new('RGB', (width, height), color='#1e40af')  # Blue background

    # Create drawing context
    draw = ImageDraw.Draw(image)

    # Add gradient effect
    for y in range(height):
        # Create gradient from blue to lighter blue
        r = int(30 + (y / height) * 50)
        g = int(64 + (y / height) * 100)
        b = int(175 + (y / height) * 50)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Add medical cross symbol
    cross_size = 40
    cross_x, cross_y = width // 2 - cross_size // 2, 100
    # Vertical bar
    draw.rectangle([cross_x + 15, cross_y, cross_x + 25, cross_y + cross_size], fill='white')
    # Horizontal bar
    draw.rectangle([cross_x, cross_y + 15, cross_x + cross_size, cross_y + 25], fill='white')

    # Add main title (try different font sizes)
    try:
        # Try to use a nice font
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
        subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
    except (IOError, OSError):
        # Fallback to default font
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()

    # Add title
    title_text = "Olho Seco"
    title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    title_y = 200
    draw.text((title_x, title_y), title_text, fill='white', font=title_font)

    # Add subtitle
    subtitle_text = "Sintomas e Tratamentos"
    subtitle_bbox = draw.textbbox((0, 0), subtitle_text, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (width - subtitle_width) // 2
    subtitle_y = 260
    draw.text((subtitle_x, subtitle_y), subtitle_text, fill='#e0f2fe', font=subtitle_font)

    # Add podcast indicator
    podcast_text = "PODCAST"
    podcast_bbox = draw.textbbox((0, 0), podcast_text, font=subtitle_font)
    podcast_width = podcast_bbox[2] - podcast_bbox[0]
    podcast_x = (width - podcast_width) // 2
    podcast_y = 320
    draw.text((podcast_x, podcast_y), podcast_text, fill='#fbbf24', font=subtitle_font)

    # Add Saraiva Vision branding
    brand_text = "Saraiva Vision"
    brand_bbox = draw.textbbox((0, 0), brand_text, font=subtitle_font)
    brand_width = brand_bbox[2] - brand_bbox[0]
    brand_x = (width - brand_width) // 2
    brand_y = 440
    draw.text((brand_x, brand_y), brand_text, fill='white', font=subtitle_font)

    # Add eye drop symbols
    drop_positions = [(100, 300), (412, 300)]
    for drop_x, drop_y in drop_positions:
        # Simple water drop shape
        draw.ellipse([drop_x, drop_y, drop_x + 20, drop_y + 25], fill='#60a5fa')
        draw.polygon([(drop_x + 10, drop_y - 5), (drop_x, drop_y + 10), (drop_x + 20, drop_y + 10)], fill='#60a5fa')

    # Save with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"olho_seco_cover_custom_{timestamp}.png"
    filepath = OUTPUT_DIR / filename

    image.save(filepath, 'PNG')
    file_size = filepath.stat().st_size

    print(f"✅ Custom podcast cover created: {filename}")
    print(f"📏 File size: {file_size:,} bytes")
    print(f"📂 Full path: {filepath}")

    return filepath

def main():
    """Main function"""
    print("🏥 SARAIVA VISION - CUSTOM PODCAST COVER CREATOR")
    print("=" * 50)
    print("📻 Episode: Olho Seco - Sintomas e Tratamentos")
    print("=" * 50)

    try:
        filepath = create_podcast_cover()
        print(f"\n✅ Custom podcast cover created successfully!")
        print(f"🎨 New cover saved to: {filepath}")
    except Exception as e:
        print(f"\n❌ Error creating cover: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()