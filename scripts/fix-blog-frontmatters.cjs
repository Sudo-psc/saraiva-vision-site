#!/usr/bin/env node
/**
 * Script para corrigir frontmatters incongruentes dos posts do blog
 * Baseado na análise de congruência título-conteúdo
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '../src/content/blog');

// Mapeamento de correções (slug → novos valores)
const corrections = {
  'alimentacao-microbioma-ocular-saude-visao-caratinga-mg': {
    title: 'Alimentação e Microbioma Ocular: Nutrição para Saúde da Visão | Caratinga MG',
    excerpt: 'Descubra como alimentação rica em vitaminas A, C, E e ômega-3 protege sua visão. Dr. Philipe Saraiva explica papel do microbioma em Caratinga, MG.',
    metaDescription: 'Nutrientes essenciais para saúde ocular: vitaminas A, C, E, ômega-3 e microbioma intestinal. Dr. Philipe Saraiva orienta sobre alimentação para visão em Caratinga, MG.',
    image: '/Blog/capa-nutricao-visao.png'
  },

  'cirurgia-refrativa-lentes-intraoculares-caratinga': {
    title: 'Cirurgia Refrativa e Lentes Intraoculares Premium | Caratinga MG',
    excerpt: 'Inovações em PRK, LASIK, SMILE e lentes multifocais/EDOF. Dr. Philipe Saraiva oferece correção visual avançada em Caratinga, MG.',
    metaDescription: 'Cirurgia refrativa (PRK, LASIK, SMILE) e lentes intraoculares premium (multifocais, EDOF, tóricas). Dr. Philipe Saraiva em Caratinga, MG.',
    image: '/Blog/capa-cirurgia-refrativa.png'
  },

  'como-inteligencia-artificial-transforma-exames-oftalmologicos-caratinga-mg': {
    title: 'Como a Inteligência Artificial Transforma Exames Oftalmológicos | Caratinga MG',
    excerpt: 'IA revoluciona diagnóstico de retinopatia diabética e glaucoma. Dr. Philipe Saraiva usa tecnologia avançada em Caratinga, MG.',
    metaDescription: 'Inteligência artificial (IA) em exames oftalmológicos: OCT-A, detecção precoce de glaucoma e retinopatia. Dr. Philipe Saraiva em Caratinga, MG.',
    image: '/Blog/capa-ia-oftalmologia.png'
  },

  'doenca-de-coats-meninos-jovens-caratinga-mg': {
    title: 'Doença de Coats: Condição Rara em Meninos Jovens | Caratinga MG',
    excerpt: 'Doença de Coats afeta principalmente meninos: saiba sintomas, diagnóstico e tratamentos. Dr. Philipe Saraiva orienta em Caratinga, MG.',
    metaDescription: 'Doença de Coats: exsudação retiniana em meninos jovens. Sintomas, diagnóstico e tratamento com laser/crioterapia. Dr. Philipe Saraiva em Caratinga, MG.',
    image: '/Blog/capa-coats.png'
  },

  'lentes-de-contato-para-presbiopia-caratinga-mg': {
    title: 'Lentes de Contato Multifocais para Presbiopia (Vista Cansada) | Caratinga MG',
    excerpt: 'Lentes multifocais e monovisão para presbiopia após 40 anos. Dr. Philipe Saraiva adapta lentes personalizadas em Caratinga, MG.',
    metaDescription: 'Lentes de contato multifocais e monovisão para presbiopia (vista cansada) após 40 anos. Adaptação personalizada em Caratinga, MG.',
    image: '/Blog/capa-lentes-presbiopia.png'
  },

  'lentes-especiais-daltonismo-caratinga': {
    title: 'Lentes Especiais para Daltonismo: Tecnologia que Transforma Cores | Caratinga MG',
    excerpt: 'Lentes filtrantes para daltonismo melhoram percepção de cores. Dr. Philipe Saraiva avalia e adapta em Caratinga, MG.',
    metaDescription: 'Lentes especiais para daltonismo (protanopia, deuteranopia): óculos filtrantes melhoram percepção de cores. Dr. Philipe Saraiva em Caratinga, MG.',
    image: '/Blog/capa-daltonismo.png'
  },

  'lentes-premium-cirurgia-catarata-caratinga-mg': {
    title: 'Lentes Premium para Cirurgia de Catarata: Multifocais e Tóricas | Caratinga MG',
    excerpt: 'Lentes intraoculares premium reduzem dependência de óculos. Dr. Philipe Saraiva oferece tecnologia avançada em Caratinga, MG.',
    metaDescription: 'Lentes premium para catarata: multifocais, tóricas e EDOF. Cirurgia moderna reduz dependência de óculos. Dr. Philipe Saraiva em Caratinga, MG.',
    image: '/Blog/capa-lentes-premium.png'
  },

  'obstrucao-ducto-lacrimal-lacrimejamento-caratinga': {
    title: 'Obstrução do Ducto Lacrimal: Causas e Tratamento do Lacrimejamento | Caratinga MG',
    excerpt: 'Lacrimejamento constante pode ser obstrução lacrimal. Dr. Philipe Saraiva trata desde massagem de Crigler a DCR em Caratinga, MG.',
    metaDescription: 'Obstrução ducto lacrimal causa lacrimejamento constante. Tratamento: massagem Crigler, sondagem e DCR. Dr. Philipe Saraiva em Caratinga, MG.',
    image: '/Blog/capa-lacrimejamento.png'
  },

  'oftalmologia-pediatrica-caratinga-quando-levar-criancas': {
    title: 'Oftalmologia Pediátrica: Quando Levar Crianças ao Oftalmologista | Caratinga MG',
    excerpt: '80% do aprendizado infantil ocorre pela visão. Dr. Philipe Saraiva orienta sobre check-ups pediátricos em Caratinga, MG.',
    metaDescription: 'Oftalmologia pediátrica: teste do olhinho, ambliopia, estrabismo. Quando levar crianças ao oftalmologista. Dr. Philipe Saraiva em Caratinga, MG.',
    image: '/Blog/capa-pediatria.png'
  },

  'olho-seco-blefarite-lacrimejamento-caratinga-tratamento': {
    title: 'Olho Seco e Blefarite: Por Que Causam Lacrimejamento Excessivo | Caratinga MG',
    excerpt: 'Paradoxo do olho seco: lacrimejamento e blefarite. Dr. Philipe Saraiva explica tratamentos personalizados em Caratinga, MG.',
    metaDescription: 'Olho seco e blefarite causam lacrimejamento excessivo. Entenda o paradoxo e tratamentos: lágrimas artificiais, higiene palpebral. Caratinga, MG.',
    image: '/Blog/capa-olho-seco.png'
  },

  'presbiopia-o-que-e-cura-cirurgia-lentes-contato-caratinga-mg': {
    title: 'Presbiopia (Vista Cansada): Existe Cura? Cirurgia e Lentes de Contato | Caratinga MG',
    excerpt: 'Presbiopia após 40 anos: opções de correção com cirurgia, lentes multifocais e óculos. Dr. Philipe Saraiva esclarece em Caratinga, MG.',
    metaDescription: 'Presbiopia (vista cansada) após 40 anos: correção com óculos progressivos, lentes multifocais ou cirurgia. Dr. Philipe Saraiva em Caratinga, MG.',
    image: '/Blog/capa-presbiopia.png'
  },

  'sindrome-visao-computador-prevencao-manejo-caratinga-mg': {
    title: 'Síndrome da Visão de Computador: Fadiga Ocular Digital | Caratinga MG',
    excerpt: 'Fadiga visual, olho seco e cefaleia por telas. Regra 20-20-20 e proteção contra luz azul. Dr. Philipe Saraiva orienta em Caratinga, MG.',
    metaDescription: 'Síndrome da visão de computador: fadiga ocular digital, olho seco e cefaleia. Regra 20-20-20 e filtros de luz azul. Caratinga, MG.',
    image: '/Blog/capa-fadiga-digital.png'
  },

  'terapias-geneticas-celulas-tronco-oftalmologia-doencas-hereditarias-caratinga-mg': {
    title: 'Terapias Genéticas e Células-Tronco em Oftalmologia: Futuro das Doenças Hereditárias | Caratinga MG',
    excerpt: 'Luxturna e células-tronco revolucionam tratamento de amaurose congênita e retinose pigmentar. Dr. Philipe Saraiva em Caratinga, MG.',
    metaDescription: 'Terapias genéticas (Luxturna) e células-tronco para amaurose congênita, retinose pigmentar e DMRI. Futuro da oftalmologia em Caratinga, MG.',
    image: '/Blog/capa-terapias-geneticas.png'
  }
};

function updateFrontmatter(filePath, newData) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Encontrar frontmatter
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    console.log(`⚠️  No frontmatter found in ${path.basename(filePath)}`);
    return false;
  }

  let frontmatter = match[1];

  // Atualizar campos
  if (newData.title) {
    frontmatter = frontmatter.replace(
      /title: .*/,
      `title: ${newData.title}`
    );
  }

  if (newData.excerpt) {
    frontmatter = frontmatter.replace(
      /excerpt: .*/,
      `excerpt: ${newData.excerpt}`
    );
  }

  if (newData.metaDescription) {
    frontmatter = frontmatter.replace(
      /metaDescription: .*/,
      `metaDescription: ${newData.metaDescription}`
    );
  }

  if (newData.image) {
    frontmatter = frontmatter.replace(
      /image: .*/,
      `image: ${newData.image}`
    );

    // Atualizar também ogImage
    frontmatter = frontmatter.replace(
      /ogImage: .*/,
      `ogImage: ${newData.image}`
    );
  }

  // Reconstruir arquivo
  const newContent = content.replace(frontmatterRegex, `---\n${frontmatter}\n---`);

  fs.writeFileSync(filePath, newContent, 'utf-8');
  return true;
}

function main() {
  console.log('🔧 Corrigindo frontmatters incongruentes do blog...\n');

  let corrected = 0;
  let errors = 0;

  for (const [slug, newData] of Object.entries(corrections)) {
    const filePath = path.join(BLOG_DIR, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${slug}.md`);
      errors++;
      continue;
    }

    try {
      if (updateFrontmatter(filePath, newData)) {
        console.log(`✅ ${slug}.md`);
        corrected++;
      }
    } catch (error) {
      console.log(`❌ Error updating ${slug}.md: ${error.message}`);
      errors++;
    }
  }

  console.log(`\n📊 Resultado:`);
  console.log(`   ✅ Corrigidos: ${corrected}`);
  console.log(`   ❌ Erros: ${errors}`);
  console.log(`   📝 Total: ${Object.keys(corrections).length}`);

  if (corrected > 0) {
    console.log(`\n🚀 Execute: npm run build para regenerar blog`);
  }
}

main();
