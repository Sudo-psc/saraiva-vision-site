#!/usr/bin/env python3
"""
Gemini 2.5 Flash Image Preview Cover Generator
Saraiva Vision - Specialized for Conversational Editing and Creative Combinations

Gemini Flash Image é IDEAL para:
- Edições conversacionais multi-turno
- Combinação criativa de múltiplas imagens
- Geração intercalada de texto e imagem
- Transferência de estilo e composição complexa
- Contexto profundo e manipulação flexível

Uso:
    python generate_covers_gemini_flash.py --post-id 22
    python generate_covers_gemini_flash.py --category "Tecnologia"
    python generate_covers_gemini_flash.py --post-id 16 --edit mode
"""

import os
import sys
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO

# Diretório de saída
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "Blog"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Estilos por categoria (otimizados para Gemini Flash)
CATEGORY_STYLES_GEMINI = {
    'Prevenção': {
        'narrative_description': 'A scene representing preventive eye healthcare for families',
        'color_mood': 'emerald green tones (#10B981) conveying trust and health',
        'composition_style': 'balanced, centered composition with symbolic elements',
        'key_elements': 'protective shield overlaying an eye symbol, caring hands, health cross',
        'atmosphere': 'trustworthy, professional, welcoming healthcare environment',
        'artistic_direction': 'modern medical photography meets abstract symbolism'
    },
    'Tratamento': {
        'narrative_description': 'A therapeutic medical scene showing advanced eye treatment',
        'color_mood': 'professional blue (#3B82F6) representing science and precision',
        'composition_style': 'dynamic perspective with depth, showing medical precision',
        'key_elements': 'medical instruments, precision tools, healing symbols',
        'atmosphere': 'scientific, precise, therapeutic, cutting-edge medicine',
        'artistic_direction': 'high-tech medical facility with clinical perfection'
    },
    'Tecnologia': {
        'narrative_description': 'Futuristic medical technology transforming ophthalmology',
        'color_mood': 'futuristic purple and blue gradients (#8B5CF6, #06B6D4) with neon accents',
        'composition_style': 'isometric 3D rendered scene with holographic overlays',
        'key_elements': 'AI neural networks, digital eye scans, holographic interfaces',
        'atmosphere': 'innovative, futuristic, cutting-edge, science fiction medical',
        'artistic_direction': '3D rendered volumetric lighting with cyberpunk aesthetics'
    },
    'Dúvidas Frequentes': {
        'narrative_description': 'An educational scene answering common eye health questions',
        'color_mood': 'warm amber and golden yellow (#F59E0B, #FCD34D) creating accessibility',
        'composition_style': 'friendly, approachable layout with dialogue elements',
        'key_elements': 'question marks, information bubbles, educational symbols',
        'atmosphere': 'educational, accessible, informative, welcoming',
        'artistic_direction': 'modern flat illustration with depth and friendly design'
    }
}

# Template de prompt otimizado para Gemini Flash (conversacional)
GEMINI_FLASH_PROMPT_TEMPLATE = """Generate an image in 16:9 widescreen landscape format.

{narrative_description}

COLOR & MOOD: {color_mood}
COMPOSITION: {composition_style}
VISUAL ELEMENTS: {key_elements}
ATMOSPHERE: {atmosphere}
ARTISTIC STYLE: {artistic_direction}

TECHNICAL REQUIREMENTS:
- 16:9 landscape widescreen format
- High quality professional imagery
- NO text, NO words, NO letters anywhere in the image
- Soft professional lighting
- Modern clean medical aesthetic
- Suitable for Brazilian ophthalmology clinic blog
- Abstract symbolic representation (avoid identifiable faces)

CONTEXT: This is a blog cover for "{title_context}" about {excerpt_summary}

Generate the visual image now. Focus on symbolic representation that captures the essence without literal interpretation."""


class GeminiFlashCoverGenerator:
    """Gerador especializado usando Gemini 2.5 Flash Image Preview"""

    def __init__(self, api_key: str):
        """Inicializa gerador Gemini Flash"""
        self.api_key = api_key
        self.model_name = 'gemini-2.5-flash-image-preview'
        self.client = genai.Client(api_key=api_key)

        print(f"✓ Gemini 2.5 Flash Image Preview inicializado")

    def create_prompt(self, post_data: Dict) -> str:
        """Cria prompt narrativo para Gemini Flash"""

        title = post_data.get('title', '')
        category = post_data.get('category', 'Prevenção')
        excerpt = post_data.get('excerpt', '')

        # Obter configurações de estilo
        style = CATEGORY_STYLES_GEMINI.get(category, CATEGORY_STYLES_GEMINI['Prevenção'])

        # Contexto simplificado
        title_context = title.split(':')[0] if ':' in title else title[:60]
        excerpt_summary = excerpt[:150] if excerpt else 'medical eye health information'

        prompt = GEMINI_FLASH_PROMPT_TEMPLATE.format(
            narrative_description=style['narrative_description'],
            color_mood=style['color_mood'],
            composition_style=style['composition_style'],
            key_elements=style['key_elements'],
            atmosphere=style['atmosphere'],
            artistic_direction=style['artistic_direction'],
            title_context=title_context,
            excerpt_summary=excerpt_summary
        )

        return prompt

    def generate_image(self, prompt: str, post_id: int) -> List[str]:
        """Gera imagem usando Gemini Flash"""

        print(f"\n🎨 Gerando imagem com Gemini 2.5 Flash Image Preview...")

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[prompt],
            )

            saved_files = []
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

            # Processar resposta
            for candidate in response.candidates:
                for idx, part in enumerate(candidate.content.parts):
                    if part.text is not None:
                        print(f"💬 Resposta do modelo (texto):")
                        print("-"*70)
                        preview = part.text[:200] + "..." if len(part.text) > 200 else part.text
                        print(preview)
                        print("-"*70)

                    elif part.inline_data is not None:
                        filename = f"capa_post_{post_id}_gemini_flash_{timestamp}.png"
                        filepath = OUTPUT_DIR / filename

                        # Processar imagem
                        image = Image.open(BytesIO(part.inline_data.data))
                        image.save(str(filepath), format='PNG', optimize=True)

                        file_size = filepath.stat().st_size
                        print(f"✓ Imagem salva: {filename} ({file_size:,} bytes)")
                        print(f"   Dimensões: {image.size[0]}x{image.size[1]}")
                        saved_files.append(str(filepath))

            if not saved_files:
                print("\n⚠️  Nenhuma imagem foi gerada.")
                print("💡 O modelo pode ter retornado apenas texto descritivo.")
                print("   Tente com prompt mais direto ou use Imagen 4 para fotorealismo.")

            return saved_files

        except Exception as e:
            print(f"✗ Erro ao gerar imagem: {str(e)}")
            import traceback
            traceback.print_exc()
            return []

    def generate_cover(self, post_data: Dict) -> List[str]:
        """Gera capa para um post"""

        post_id = post_data.get('id', 0)
        title = post_data.get('title', 'Sem título')
        category = post_data.get('category', 'Prevenção')

        print("\n" + "="*70)
        print(f"📰 Gerando capa com Gemini Flash Image Preview")
        print(f"🆔 Post ID: {post_id}")
        print(f"📂 Categoria: {category}")
        print(f"📝 Título: {title}")
        print("="*70)

        # Criar prompt
        prompt = self.create_prompt(post_data)

        print(f"\n🤖 Prompt (preview):")
        print(prompt[:300] + "..." if len(prompt) > 300 else prompt)

        # Gerar imagem
        return self.generate_image(prompt, post_id)

    def edit_image(self, image_path: str, edit_instruction: str, post_id: int) -> List[str]:
        """
        Edita uma imagem existente (funcionalidade avançada do Gemini Flash)

        Args:
            image_path: Caminho da imagem para editar
            edit_instruction: Instrução de edição em linguagem natural
            post_id: ID do post

        Returns:
            Lista de caminhos das imagens editadas
        """
        print(f"\n✏️  Editando imagem com Gemini Flash...")
        print(f"📁 Imagem original: {image_path}")
        print(f"📝 Instrução: {edit_instruction}")

        try:
            # Carregar imagem
            with open(image_path, 'rb') as f:
                image_data = f.read()

            # Criar prompt de edição
            edit_prompt = f"""{edit_instruction}

Maintain the original style and quality.
Keep 16:9 landscape format.
NO text or words in the image."""

            # Gerar com imagem de entrada
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[
                    types.Content(parts=[
                        types.Part(inline_data=types.Blob(
                            mime_type='image/png',
                            data=image_data
                        )),
                        types.Part(text=edit_prompt)
                    ])
                ]
            )

            saved_files = []
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

            for candidate in response.candidates:
                for part in candidate.content.parts:
                    if part.inline_data is not None:
                        filename = f"capa_post_{post_id}_gemini_edited_{timestamp}.png"
                        filepath = OUTPUT_DIR / filename

                        image = Image.open(BytesIO(part.inline_data.data))
                        image.save(str(filepath), format='PNG', optimize=True)

                        file_size = filepath.stat().st_size
                        print(f"✓ Imagem editada salva: {filename} ({file_size:,} bytes)")
                        saved_files.append(str(filepath))

            return saved_files

        except Exception as e:
            print(f"✗ Erro ao editar imagem: {str(e)}")
            import traceback
            traceback.print_exc()
            return []


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
        description='Gemini 2.5 Flash Image Preview Cover Generator',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument('--post-id', type=int, help='ID do post')
    parser.add_argument('--category', type=str, help='Categoria de posts')
    parser.add_argument('--all', action='store_true', help='Todos os posts')
    parser.add_argument('--list', action='store_true', help='Listar posts')
    parser.add_argument('--edit', type=str, help='Editar imagem existente (caminho)')
    parser.add_argument('--edit-instruction', type=str, help='Instrução de edição')

    args = parser.parse_args()

    print("\n" + "="*70)
    print("🏥 SARAIVA VISION - Gemini Flash Image Generator")
    print("="*70)

    # API Key
    api_key = os.environ.get('GOOGLE_GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        print("\n✗ API key não encontrada!")
        print("export GOOGLE_GEMINI_API_KEY='sua-chave'")
        sys.exit(1)

    # Modo de edição
    if args.edit and args.edit_instruction:
        generator = GeminiFlashCoverGenerator(api_key)
        post_id = args.post_id or 0
        generator.edit_image(args.edit, args.edit_instruction, post_id)
        sys.exit(0)

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
    print(f"\n🚀 Inicializando Gemini 2.5 Flash Image Preview")
    generator = GeminiFlashCoverGenerator(api_key)

    # Gerar capas
    print(f"\n🎨 Gerando capas para {len(selected_posts)} post(s)...")
    total_generated = 0

    for post in selected_posts:
        files = generator.generate_cover(post)
        total_generated += len(files)

    # Resumo
    print("\n" + "="*70)
    print("✅ GERAÇÃO COMPLETA!")
    print(f"📊 Total: {total_generated} imagens")
    print(f"📂 Diretório: {OUTPUT_DIR}")
    print("="*70 + "\n")


if __name__ == "__main__":
    main()
