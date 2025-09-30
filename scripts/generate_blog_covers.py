#!/usr/bin/env python3
"""
Script de Geração de Capas para Blog Posts
Saraiva Vision - Medical Blog Cover Image Generator

Utiliza Google Gemini API (Imagen 4 e Gemini 2.5 Flash Image) para gerar
imagens de capa profissionais e otimizadas para posts do blog médico.

Requisitos:
    pip install google-generativeai pillow python-dotenv

Uso:
    python generate_blog_covers.py --post-id 22
    python generate_blog_covers.py --category "Tecnologia"
    python generate_blog_covers.py --all
"""

import os
import sys
import json
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO


# ============================================================================
# CONFIGURAÇÕES
# ============================================================================

# Diretório de saída para as imagens
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "Blog"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Configuração de categorias e estilos visuais
CATEGORY_STYLES = {
    'Prevenção': {
        'color_palette': 'tons de verde esmeralda e branco limpo',
        'mood': 'confiável, profissional, preventivo',
        'visual_elements': 'escudo médico, símbolos de saúde, elementos de proteção',
        'style': 'fotografia médica profissional, clean e moderna'
    },
    'Tratamento': {
        'color_palette': 'azul profissional e tons de confiança',
        'mood': 'científico, preciso, terapêutico',
        'visual_elements': 'equipamentos médicos, símbolos de cura, elementos clínicos',
        'style': 'fotografia hospitalar moderna, high-tech e limpa'
    },
    'Tecnologia': {
        'color_palette': 'roxo futurista, azul tecnológico, gradientes modernos',
        'mood': 'inovador, futurista, cutting-edge',
        'visual_elements': 'tecnologia médica avançada, interfaces digitais, elementos de IA',
        'style': 'renderização 3D futurista, design tech moderno'
    },
    'Dúvidas Frequentes': {
        'color_palette': 'âmbar caloroso, amarelo dourado, tons acolhedores',
        'mood': 'educacional, acessível, informativo',
        'visual_elements': 'ícones de pergunta, diálogos, elementos educativos',
        'style': 'ilustração médica moderna, friendly e profissional'
    }
}

# Template base para prompts médicos oftalmológicos
MEDICAL_PROMPT_TEMPLATE = """Generate an image in 16:9 landscape format.

Professional medical blog cover for ophthalmology clinic:
Theme: {title}
Category: {category}
Style: {style}
Colors: {color_palette}
Mood: {mood}
Elements: {visual_elements}

Requirements:
- 16:9 widescreen landscape format
- High resolution professional quality
- Clean modern medical design
- NO text NO words NO letters
- Professional soft lighting
- Abstract symbolic representation
- Suitable for Brazilian medical clinic

Context: {medical_context}

Generate the visual image now."""


# ============================================================================
# CLASSE PRINCIPAL
# ============================================================================

class BlogCoverGenerator:
    """Gerador de capas para posts do blog usando Google Gemini API"""

    def __init__(self, api_key: str, model: str = "gemini-flash"):
        """
        Inicializa o gerador de imagens

        Args:
            api_key: Chave da API do Google
            model: Modelo a usar ("gemini-flash" ou "gemini-pro")
        """
        self.api_key = api_key
        self.model_type = model

        # Usar novo cliente GenAI
        self.client = genai.Client(api_key=api_key)

        # Definir modelo
        if model == "gemini-flash":
            self.model_name = 'gemini-2.5-flash-image-preview'
        elif model == "gemini-pro":
            self.model_name = 'gemini-2.5-pro'
        else:
            raise ValueError(f"Modelo inválido: {model}. Use 'gemini-flash' ou 'gemini-pro'")

    def create_prompt(self, post_data: Dict) -> str:
        """
        Cria um prompt otimizado baseado nos dados do post

        Args:
            post_data: Dicionário com dados do post (title, category, excerpt, etc)

        Returns:
            Prompt otimizado para geração de imagem
        """
        title = post_data.get('title', '')
        category = post_data.get('category', 'Prevenção')
        excerpt = post_data.get('excerpt', '')

        # Obter configurações de estilo da categoria
        style_config = CATEGORY_STYLES.get(category, CATEGORY_STYLES['Prevenção'])

        # Criar contexto médico a partir do título e excerpt
        medical_context = f"{title}. {excerpt}"

        prompt = MEDICAL_PROMPT_TEMPLATE.format(
            title=title,
            category=category,
            style=style_config['style'],
            color_palette=style_config['color_palette'],
            mood=style_config['mood'],
            visual_elements=style_config['visual_elements'],
            medical_context=medical_context[:300]  # Limitar tamanho
        )

        return prompt

    def generate_with_gemini(self, prompt: str, post_id: int, post_data: Dict = None) -> List[str]:
        """
        Gera imagens usando Gemini 2.5 Flash Image Preview

        Args:
            prompt: Prompt de geração
            post_id: ID do post para naming
            post_data: Dados completos do post (opcional)

        Returns:
            Lista de caminhos dos arquivos salvos
        """
        print(f"\n🎨 Gerando imagem com Gemini 2.5 Flash Image Preview...")
        print(f"📝 Post ID: {post_id}")
        print(f"🤖 Modelo: {self.model_name}")

        if post_data is None:
            post_data = {'title': 'Blog Post', 'category': 'General'}

        try:
            # Gerar conteúdo usando novo cliente GenAI
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[prompt],
            )

            saved_files = []
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            image_count = 0

            # Processar resposta
            print(f"📊 Resposta recebida. Candidatos: {len(response.candidates)}")

            for candidate in response.candidates:
                for part in candidate.content.parts:
                    # Verificar se há texto
                    if part.text is not None:
                        print(f"💬 Descrição gerada pelo modelo:")
                        print("-"*70)
                        print(part.text[:300] + "..." if len(part.text) > 300 else part.text)
                        print("-"*70)

                    # Verificar se há imagem
                    elif part.inline_data is not None:
                        image_count += 1
                        filename = f"capa_post_{post_id}_gemini_{timestamp}_{image_count}.png"
                        filepath = OUTPUT_DIR / filename

                        # Usar PIL para processar imagem
                        image = Image.open(BytesIO(part.inline_data.data))
                        image.save(str(filepath))

                        file_size = filepath.stat().st_size
                        print(f"✓ Imagem {image_count} salva: {filename} ({file_size:,} bytes)")
                        print(f"   Dimensões: {image.size[0]}x{image.size[1]}")
                        saved_files.append(str(filepath))

            if image_count == 0:
                print("\n⚠️  Nenhuma imagem foi gerada.")
                print("💡 O modelo retornou apenas texto descritivo.")
                print("   Isso pode acontecer se:")
                print("   1. O prompt não solicitou explicitamente uma imagem")
                print("   2. O modelo interpretou como pedido de descrição")
                print("   3. Há restrições de conteúdo aplicadas")

            return saved_files

        except Exception as e:
            print(f"✗ Erro ao gerar imagem: {str(e)}")
            print("\n💡 Dica: Verifique se:")
            print("   1. A API key tem permissões para geração de imagem")
            print("   2. O modelo está disponível na sua região")
            print("   3. Há créditos suficientes na conta")
            import traceback
            traceback.print_exc()
            return []

    def generate_cover(self, post_data: Dict) -> List[str]:
        """
        Gera capa para um post

        Args:
            post_data: Dados do post

        Returns:
            Lista de caminhos das imagens geradas
        """
        post_id = post_data.get('id', 0)
        title = post_data.get('title', 'Sem título')

        print("\n" + "="*70)
        print(f"📰 Gerando capa para: {title}")
        print(f"🆔 Post ID: {post_id}")
        print(f"📂 Categoria: {post_data.get('category', 'N/A')}")
        print("="*70)

        # Criar prompt
        prompt = self.create_prompt(post_data)

        # Mostrar prompt (truncado)
        print(f"\n🤖 Prompt gerado (preview):")
        print(prompt[:300] + "..." if len(prompt) > 300 else prompt)

        # Gerar descrição usando Gemini
        return self.generate_with_gemini(prompt, post_id, post_data)


# ============================================================================
# FUNÇÕES AUXILIARES
# ============================================================================

def load_blog_posts_data() -> List[Dict]:
    """
    Carrega dados dos posts do blog do arquivo JavaScript

    Returns:
        Lista de dicionários com dados dos posts
    """
    blog_data_path = Path(__file__).parent.parent / "src" / "data" / "blogPosts.js"

    if not blog_data_path.exists():
        print(f"✗ Arquivo de dados não encontrado: {blog_data_path}")
        return []

    # Parse básico do arquivo JS para extrair dados dos posts
    # Nota: Para produção, considere usar um parser JS adequado
    posts = []

    try:
        with open(blog_data_path, 'r', encoding='utf-8') as f:
            content = f.read()

            # Extrair posts (parsing simplificado)
            # Em produção, use um parser JS apropriado
            import re

            # Pattern para encontrar posts
            post_pattern = r'\{[\s\S]*?id:\s*(\d+)[\s\S]*?slug:\s*[\'"]([^\'"]+)[\'"][\s\S]*?title:\s*[\'"]([^\'"]+)[\'"][\s\S]*?excerpt:\s*[\'"]([^\'"]+)[\'"][\s\S]*?category:\s*[\'"]([^\'"]+)[\'"][\s\S]*?\}'

            matches = re.finditer(post_pattern, content)

            for match in matches:
                post = {
                    'id': int(match.group(1)),
                    'slug': match.group(2),
                    'title': match.group(3),
                    'excerpt': match.group(4),
                    'category': match.group(5)
                }
                posts.append(post)

        print(f"✓ {len(posts)} posts carregados do banco de dados")
        return posts

    except Exception as e:
        print(f"✗ Erro ao carregar posts: {str(e)}")
        return []


def get_api_key() -> Optional[str]:
    """
    Obtém a chave da API do Google das variáveis de ambiente

    Returns:
        Chave da API ou None se não encontrada
    """
    api_key = os.environ.get('GOOGLE_GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')

    if not api_key:
        print("\n⚠️  Chave da API não encontrada!")
        print("Configure a variável de ambiente GOOGLE_GEMINI_API_KEY ou GOOGLE_API_KEY")
        print("\nOpções:")
        print("1. export GOOGLE_GEMINI_API_KEY='sua-chave-aqui'")
        print("2. Crie um arquivo .env com: GOOGLE_GEMINI_API_KEY=sua-chave-aqui")
        print("\n🔑 Obtenha sua chave em: https://aistudio.google.com/apikey")
        return None

    return api_key


# ============================================================================
# CLI
# ============================================================================

def main():
    """Função principal do CLI"""

    parser = argparse.ArgumentParser(
        description='Gerador de capas para posts do blog Saraiva Vision',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos de uso:
  %(prog)s --post-id 22                    # Gerar capa para post específico
  %(prog)s --category "Tecnologia"         # Gerar capas para categoria
  %(prog)s --all                           # Gerar capas para todos os posts
  %(prog)s --post-id 22 --model gemini-flash  # Usar modelo Gemini Flash
        """
    )

    parser.add_argument('--post-id', type=int, help='ID do post para gerar capa')
    parser.add_argument('--category', type=str, help='Categoria de posts')
    parser.add_argument('--all', action='store_true', help='Gerar capas para todos os posts')
    parser.add_argument('--model', type=str, default='gemini-flash',
                       choices=['gemini-flash', 'gemini-pro'],
                       help='Modelo de IA a usar (padrão: gemini-flash)')
    parser.add_argument('--list', action='store_true', help='Listar posts disponíveis')

    args = parser.parse_args()

    # Banner
    print("\n" + "="*70)
    print("🏥 SARAIVA VISION - Gerador de Capas para Blog")
    print("="*70)

    # Obter API key
    api_key = get_api_key()
    if not api_key:
        sys.exit(1)

    # Carregar posts
    print("\n📚 Carregando posts do blog...")
    posts = load_blog_posts_data()

    if not posts:
        print("✗ Nenhum post encontrado!")
        sys.exit(1)

    # Listar posts se solicitado
    if args.list:
        print("\n📋 Posts disponíveis:\n")
        for post in posts:
            print(f"  ID: {post['id']:3d} | Categoria: {post['category']:20s} | {post['title']}")
        print(f"\n✓ Total: {len(posts)} posts")
        sys.exit(0)

    # Filtrar posts baseado nos argumentos
    selected_posts = []

    if args.post_id:
        selected_posts = [p for p in posts if p['id'] == args.post_id]
        if not selected_posts:
            print(f"✗ Post ID {args.post_id} não encontrado!")
            sys.exit(1)

    elif args.category:
        selected_posts = [p for p in posts if p['category'] == args.category]
        if not selected_posts:
            print(f"✗ Nenhum post encontrado na categoria '{args.category}'!")
            sys.exit(1)

    elif args.all:
        selected_posts = posts

    else:
        print("✗ Especifique --post-id, --category ou --all")
        parser.print_help()
        sys.exit(1)

    # Inicializar gerador
    print(f"\n🚀 Inicializando gerador com modelo: {args.model}")
    generator = BlogCoverGenerator(api_key, model=args.model)

    # Gerar capas
    print(f"\n🎨 Gerando capas para {len(selected_posts)} post(s)...")

    total_generated = 0
    for post in selected_posts:
        generated_files = generator.generate_cover(post)
        total_generated += len(generated_files)

    # Resumo
    print("\n" + "="*70)
    print("✅ GERAÇÃO COMPLETA!")
    print(f"📊 Total de imagens geradas: {total_generated}")
    print(f"📂 Diretório de saída: {OUTPUT_DIR}")
    print("="*70 + "\n")


if __name__ == "__main__":
    main()
