#!/usr/bin/env python3
"""
Imagen 4 Blog Cover Generator
Saraiva Vision - Specialized for High-Quality Photorealistic Medical Images

Imagen 4 é IDEAL para:
- Imagens fotorrealistas de alta qualidade
- Tipografia avançada e renderização de texto
- Branding e logos
- Detalhes artísticos específicos
- Performance rápida e custo-efetivo

Uso:
    python generate_covers_imagen.py --post-id 22
    python generate_covers_imagen.py --category "Prevenção"
"""

import os
import sys
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, List
from google import genai
from PIL import Image
from io import BytesIO

# Diretório de saída
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "Blog"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Estilos por categoria (otimizados para Imagen 4)
CATEGORY_STYLES_IMAGEN = {
    'Prevenção': {
        'photography_style': 'professional medical photography, clean studio lighting',
        'color_scheme': 'emerald green (#10B981) and clean white (#FFFFFF)',
        'composition': 'centered composition with negative space, rule of thirds',
        'elements': 'shield symbol, health cross, protective hands gesture',
        'mood': 'trustworthy, professional, preventive care',
        'camera': 'shot with 50mm prime lens, f/2.8, natural soft lighting'
    },
    'Tratamento': {
        'photography_style': 'modern medical facility photography, high-tech aesthetic',
        'color_scheme': 'professional blue (#3B82F6) and medical white',
        'composition': 'dynamic angle, depth of field, bokeh background',
        'elements': 'medical instruments, technology devices, precision tools',
        'mood': 'scientific, precise, therapeutic, advanced',
        'camera': 'shot with 85mm lens, f/1.8, clinical lighting'
    },
    'Tecnologia': {
        'photography_style': '3D rendered futuristic medical tech, volumetric lighting',
        'color_scheme': 'futuristic purple (#8B5CF6), tech blue (#06B6D4), gradient overlay',
        'composition': 'isometric view, layered depth, holographic effects',
        'elements': 'AI neural networks, digital interfaces, advanced medical scanners',
        'mood': 'innovative, cutting-edge, futuristic, high-tech',
        'camera': 'rendered with ray tracing, 4K quality, sci-fi aesthetic'
    },
    'Dúvidas Frequentes': {
        'photography_style': 'modern medical illustration, flat design with depth',
        'color_scheme': 'warm amber (#F59E0B), golden yellow (#FCD34D)',
        'composition': 'friendly layout, balanced symmetry, approachable design',
        'elements': 'question mark icon, dialogue bubbles, educational symbols',
        'mood': 'educational, accessible, informative, welcoming',
        'camera': 'illustration style, vector-inspired, clean lines'
    }
}

# Template de prompt otimizado para Imagen 4
IMAGEN_PROMPT_TEMPLATE = """A professional {photography_style} medical blog cover image.

SUBJECT: {title_short}
COMPOSITION: {composition}
STYLE: {photography_style}
COLOR PALETTE: {color_scheme}
VISUAL ELEMENTS: {elements}
MOOD: {mood}
TECHNICAL: {camera}

Requirements:
- 16:9 widescreen landscape format
- Ultra high resolution, 4K quality
- NO text, NO words, NO letters on the image
- Professional medical environment
- Soft natural lighting with subtle shadows
- Clean, modern, minimalist aesthetic
- Suitable for Brazilian ophthalmology clinic
- Abstract symbolic representation of eye health

{specialized_instruction}"""


class ImagenCoverGenerator:
    """Gerador especializado usando Imagen 4"""

    def __init__(self, api_key: str, model: str = "imagen-4.0-generate-001"):
        """
        Inicializa gerador Imagen 4

        Args:
            api_key: Google API key
            model: Imagen model version
                - imagen-4.0-generate-001 (Standard, recommended)
                - imagen-4.0-ultra-generate-001 (Ultra quality)
                - imagen-4.0-fast-generate-001 (Fast generation)
        """
        self.api_key = api_key
        self.model_name = model
        self.client = genai.Client(api_key=api_key)

        print(f"✓ Imagen 4 inicializado: {model}")

    def create_prompt(self, post_data: Dict) -> str:
        """Cria prompt otimizado para Imagen 4"""

        title = post_data.get('title', '')
        category = post_data.get('category', 'Prevenção')
        excerpt = post_data.get('excerpt', '')

        # Obter configurações de estilo
        style = CATEGORY_STYLES_IMAGEN.get(category, CATEGORY_STYLES_IMAGEN['Prevenção'])

        # Criar título curto para o prompt
        title_short = title.split(':')[0] if ':' in title else title[:80]

        # Instrução especializada baseada na categoria
        specialized_instructions = {
            'Prevenção': 'Focus on protective, preventive healthcare symbolism',
            'Tratamento': 'Emphasize medical precision and therapeutic technology',
            'Tecnologia': 'Showcase futuristic medical innovation and AI elements',
            'Dúvidas Frequentes': 'Create educational, friendly, approachable design'
        }

        prompt = IMAGEN_PROMPT_TEMPLATE.format(
            title_short=title_short,
            photography_style=style['photography_style'],
            composition=style['composition'],
            color_scheme=style['color_scheme'],
            elements=style['elements'],
            mood=style['mood'],
            camera=style['camera'],
            specialized_instruction=specialized_instructions.get(category, '')
        )

        return prompt

    def generate_images(self, prompt: str, post_id: int, num_images: int = 2,
                       aspect_ratio: str = "16:9", image_size: str = "1K") -> List[str]:
        """
        Gera imagens usando Imagen 4

        Args:
            prompt: Prompt de geração
            post_id: ID do post
            num_images: Número de imagens (1-4)
            aspect_ratio: "1:1", "3:4", "4:3", "9:16", "16:9"
            image_size: "1K" ou "2K" (apenas Ultra e Standard)

        Returns:
            Lista de caminhos das imagens salvas
        """
        print(f"\n🎨 Gerando {num_images} imagens com Imagen 4...")
        print(f"📐 Aspect Ratio: {aspect_ratio}")
        print(f"📏 Size: {image_size}")

        try:
            response = self.client.models.generate_images(
                model=self.model_name,
                prompt=prompt,
                config=genai.types.GenerateImageConfig(
                    number_of_images=num_images,
                    aspect_ratio=aspect_ratio,
                    image_size=image_size,
                    # person_generation="allow_adult"  # Padrão
                )
            )

            saved_files = []
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

            for idx, generated_image in enumerate(response.generated_images):
                image_count = idx + 1
                filename = f"capa_post_{post_id}_imagen4_opt{image_count}_{timestamp}.png"
                filepath = OUTPUT_DIR / filename

                # Processar imagem
                image = generated_image.image  # PIL Image
                image.save(str(filepath), format='PNG', optimize=True)

                file_size = filepath.stat().st_size
                print(f"✓ Imagem {image_count} salva: {filename} ({file_size:,} bytes)")
                print(f"   Dimensões: {image.size[0]}x{image.size[1]}")
                saved_files.append(str(filepath))

            return saved_files

        except Exception as e:
            print(f"✗ Erro ao gerar imagens: {str(e)}")
            import traceback
            traceback.print_exc()
            return []

    def generate_cover(self, post_data: Dict, num_variations: int = 2) -> List[str]:
        """Gera capas para um post"""

        post_id = post_data.get('id', 0)
        title = post_data.get('title', 'Sem título')
        category = post_data.get('category', 'Prevenção')

        print("\n" + "="*70)
        print(f"📰 Gerando capa com Imagen 4")
        print(f"🆔 Post ID: {post_id}")
        print(f"📂 Categoria: {category}")
        print(f"📝 Título: {title}")
        print("="*70)

        # Criar prompt
        prompt = self.create_prompt(post_data)

        print(f"\n🤖 Prompt (preview):")
        print(prompt[:300] + "..." if len(prompt) > 300 else prompt)

        # Gerar imagens
        return self.generate_images(prompt, post_id, num_images=num_variations)


def load_blog_posts_data() -> List[Dict]:
    """Carrega dados dos posts"""
    import re

    blog_data_path = Path(__file__).parent.parent / "src" / "data" / "blogPosts.js"

    if not blog_data_path.exists():
        print(f"✗ Arquivo não encontrado: {blog_data_path}")
        return []

    posts = []
    try:
        with open(blog_data_path, 'r', encoding='utf-8') as f:
            content = f.read()

            post_pattern = r'\{[\s\S]*?id:\s*(\d+)[\s\S]*?slug:\s*[\'"]([^\'"]+)[\'"][\s\S]*?title:\s*[\'"]([^\'"]+)[\'"][\s\S]*?excerpt:\s*[\'"]([^\'"]+)[\'"][\s\S]*?category:\s*[\'"]([^\'"]+)[\'"][\s\S]*?\}'

            for match in re.finditer(post_pattern, content):
                posts.append({
                    'id': int(match.group(1)),
                    'slug': match.group(2),
                    'title': match.group(3),
                    'excerpt': match.group(4),
                    'category': match.group(5)
                })

        print(f"✓ {len(posts)} posts carregados")
        return posts

    except Exception as e:
        print(f"✗ Erro ao carregar posts: {str(e)}")
        return []


def main():
    parser = argparse.ArgumentParser(
        description='Imagen 4 Blog Cover Generator',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument('--post-id', type=int, help='ID do post')
    parser.add_argument('--category', type=str, help='Categoria de posts')
    parser.add_argument('--all', action='store_true', help='Todos os posts')
    parser.add_argument('--list', action='store_true', help='Listar posts')
    parser.add_argument('--model', type=str, default='imagen-4.0-generate-001',
                       choices=['imagen-4.0-generate-001', 'imagen-4.0-ultra-generate-001',
                               'imagen-4.0-fast-generate-001'],
                       help='Modelo Imagen 4')
    parser.add_argument('--variations', type=int, default=2, help='Número de variações (1-4)')
    parser.add_argument('--aspect-ratio', type=str, default='16:9',
                       choices=['1:1', '3:4', '4:3', '9:16', '16:9'],
                       help='Proporção da imagem')

    args = parser.parse_args()

    print("\n" + "="*70)
    print("🏥 SARAIVA VISION - Imagen 4 Cover Generator")
    print("="*70)

    # API Key
    api_key = os.environ.get('GOOGLE_GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        print("\n✗ API key não encontrada!")
        print("export GOOGLE_GEMINI_API_KEY='sua-chave'")
        sys.exit(1)

    # Carregar posts
    print("\n📚 Carregando posts...")
    posts = load_blog_posts_data()

    if not posts:
        print("✗ Nenhum post encontrado!")
        sys.exit(1)

    # Listar posts
    if args.list:
        print("\n📋 Posts disponíveis:\n")
        for post in posts:
            print(f"  ID: {post['id']:3d} | {post['category']:20s} | {post['title']}")
        print(f"\n✓ Total: {len(posts)} posts")
        sys.exit(0)

    # Selecionar posts
    selected_posts = []
    if args.post_id:
        selected_posts = [p for p in posts if p['id'] == args.post_id]
    elif args.category:
        selected_posts = [p for p in posts if p['category'] == args.category]
    elif args.all:
        selected_posts = posts
    else:
        print("✗ Use --post-id, --category ou --all")
        parser.print_help()
        sys.exit(1)

    # Inicializar gerador
    print(f"\n🚀 Inicializando Imagen 4: {args.model}")
    generator = ImagenCoverGenerator(api_key, model=args.model)

    # Gerar capas
    print(f"\n🎨 Gerando capas para {len(selected_posts)} post(s)...")
    total_generated = 0

    for post in selected_posts:
        files = generator.generate_cover(post, num_variations=args.variations)
        total_generated += len(files)

    # Resumo
    print("\n" + "="*70)
    print("✅ GERAÇÃO COMPLETA!")
    print(f"📊 Total: {total_generated} imagens")
    print(f"📂 Diretório: {OUTPUT_DIR}")
    print("="*70 + "\n")


if __name__ == "__main__":
    main()
