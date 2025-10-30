/**
 * Upload Blog Images to Sanity CMS
 *
 * This script uploads missing blog post images from public/Blog/ to Sanity CMS
 * and associates them with the corresponding blog posts.
 *
 * @author Dr. Philipe Saraiva Cruz
 * @date 2025-10-30
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sanityClient } from '../src/lib/sanityClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if we have write token
if (!process.env.VITE_SANITY_TOKEN && !process.env.SANITY_TOKEN) {
  console.error('❌ Error: SANITY_TOKEN environment variable is required for uploads');
  console.error('   Set it with: export SANITY_TOKEN=your_token_here');
  process.exit(1);
}

// Image mapping: slug -> image filename
const imageMapping = {
  'lentes-contato-iniciantes-guia-completo': 'capa_post_1_imagen4_opt1_20251001_100736.png',
  'mitos-lentes-contato-verdades': 'capa-lentes-contato-tipos.png',
  'lentes-contato-tecnologias-futuro': 'capa_post_3_imagen4_opt1_20251008_132445.png',
  'monovisao-lentes-multifocais-presbiopia-caratinga-mg': 'capa-monovisao-presbiopia-optimized-1200w.webp',
  'tipos-lentes-contato-guia-completo-adaptacao-caratinga-mg': 'capa-lentes-contato-tipos-optimized-1200w.webp',
  'amaurose-congenita-leber-tratamento-genetico': 'capa-amaurose-congenita-leber-optimized-1200w.webp',
  'cirurgia-refrativa-lentes-intraoculares-caratinga': 'capa-cirurgia-refrativa-optimized-1200w.webp',
  'olho-seco-blefarite-lacrimejamento-caratinga-tratamento': 'capa-olho-seco-optimized-1200w.webp',
  'sindrome-visao-computador-prevencao-manejo-caratinga-mg': 'capa-digital-optimized-1200w.webp',
  'terapias-geneticas-celulas-tronco-oftalmologia-doencas-hereditarias-caratinga-mg': 'capa-terapias-geneticas-optimized-1200w.webp',
  'doenca-de-coats-meninos-jovens-caratinga-mg': 'coats.png',
  'como-inteligencia-artificial-transforma-exames-oftalmologicos-caratinga-mg': 'capa-ia-optimized-1200w.webp',
  'cuidados-visuais-esportes-caratinga': 'capa-cuidados-visuais-esportes-optimized-1200w.webp',
  'lentes-especiais-daltonismo-caratinga': 'capa-daltonismo-optimized-1200w.webp',
  'descolamento-retina-mitos-verdades-caratinga': 'capa-descolamento-retina-optimized-1200w.webp',
  'presbiopia-o-que-e-cura-cirurgia-lentes-contato-caratinga-mg': 'capa-presbiopia-optimized-1200w.webp',
  'moscas-volantes-quando-preocupar-caratinga': 'capa-moscas-volantes-optimized-1200w.webp',
  'retinose-pigmentar-luxturna-caratinga': 'capa-retinose-pigmentar-optimized-1200w.webp',
  'teste-olhinho-retinoblastoma-prevencao-caratinga-mg': 'capa-teste-olhinho-optimized-1200w.webp',
  'mitos-verdades-saude-ocular-ciencia-caratinga-mg': 'capa-lampada-optimized-1200w.webp',
  'pterigio-guia-completo-prevencao-cuidados-cirurgia': 'pterigio-capa-optimized-1200w.webp',
  'alimentacao-microbioma-ocular-saude-visao-caratinga-mg': 'capa-alimentacao-microbioma-ocular-optimized-1200w.webp',
  'estrabismo-quando-desconfiar-procurar-oftalmologista-caratinga-mg': 'capa-estrabismo-optimized-1200w.webp',
  'obstrucao-ducto-lacrimal-lacrimejamento-caratinga': 'capa-ductolacrimal-optimized-1200w.webp',
  'lentes-premium-cirurgia-catarata-caratinga-mg': 'capa-lentes-premium-catarata-optimized-1200w.webp',
  'oftalmologia-pediatrica-caratinga-quando-levar-criancas': 'capa-pediatria-optimized-1200w.webp',
  'lentes-de-contato-para-presbiopia-caratinga-mg': 'capa-lentes-presbiopia-optimized-1200w.webp',
  'sensibilidade-a-luz-causas-tratamentos-caratinga-mg': 'capa-fotofobia-optimized-1200w.webp'
};

/**
 * Upload image to Sanity and get asset reference
 */
async function uploadImage(imagePath, imageName) {
  try {
    console.log(`   📤 Uploading ${imageName}...`);

    const imageBuffer = fs.readFileSync(imagePath);
    const asset = await sanityClient.assets.upload('image', imageBuffer, {
      filename: imageName
    });

    console.log(`   ✅ Uploaded: ${asset._id}`);
    return asset._id;
  } catch (error) {
    console.error(`   ❌ Upload failed: ${error.message}`);
    throw error;
  }
}

/**
 * Update blog post with image reference
 */
async function updatePostWithImage(postId, imageAssetId, postTitle) {
  try {
    console.log(`   🔗 Linking image to post...`);

    await sanityClient
      .patch(postId)
      .set({
        mainImage: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAssetId
          },
          alt: postTitle
        }
      })
      .commit();

    console.log(`   ✅ Post updated`);
  } catch (error) {
    console.error(`   ❌ Update failed: ${error.message}`);
    throw error;
  }
}

/**
 * Main upload process
 */
async function uploadBlogImages() {
  console.log('🚀 Starting Sanity Image Upload Process\n');
  console.log(`📁 Blog directory: ${path.join(__dirname, '..', 'public', 'Blog')}\n`);

  const blogDir = path.join(__dirname, '..', 'public', 'Blog');
  const slugs = Object.keys(imageMapping);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const imageName = imageMapping[slug];
    const imagePath = path.join(blogDir, imageName);

    console.log(`\n[${i + 1}/${slugs.length}] Processing: ${slug}`);

    try {
      // Check if image exists
      if (!fs.existsSync(imagePath)) {
        console.log(`   ⚠️  Image not found: ${imageName}`);
        errorCount++;
        continue;
      }

      // Find post in Sanity
      const post = await sanityClient.fetch(
        `*[_type == "blogPost" && slug.current == $slug][0] { _id, title, mainImage }`,
        { slug }
      );

      if (!post) {
        console.log(`   ⚠️  Post not found in Sanity`);
        errorCount++;
        continue;
      }

      // Check if post already has image
      if (post.mainImage?.asset?._ref) {
        console.log(`   ℹ️  Post already has image, skipping`);
        skippedCount++;
        continue;
      }

      // Upload image
      const assetId = await uploadImage(imagePath, imageName);

      // Update post
      await updatePostWithImage(post._id, assetId, post.title);

      successCount++;
      console.log(`   ✨ Success!`);

    } catch (error) {
      console.error(`   💥 Error: ${error.message}`);
      errorCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Upload Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`⚠️  Errors: ${errorCount}`);
  console.log(`ℹ️  Skipped: ${skippedCount}`);
  console.log(`📝 Total: ${slugs.length}`);
  console.log('='.repeat(60));

  if (successCount > 0) {
    console.log('\n✨ Images uploaded successfully!');
    console.log('🔄 Please verify images in Sanity Studio: https://saraivavision.sanity.studio');
  }
}

// Run the upload process
uploadBlogImages().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
