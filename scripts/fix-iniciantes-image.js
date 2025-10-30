/**
 * Fix "Lentes de Contato para Iniciantes" Image
 *
 * Corrects the image for the beginners post that was showing the wrong image
 *
 * @author Dr. Philipe Saraiva Cruz
 * @date 2025-10-30
 */

import { sanityClient } from '../src/lib/sanityClient.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixImage() {
  console.log('🔧 Fixing "Lentes de Contato para Iniciantes" image\n');

  // Try multiple image options in order of preference
  const imageOptions = [
    'capa-lentes-de-contato-gelatinosas-optimized-1200w.webp',
    'lentecontado.png',
    'lentes.jpeg',
    'capa-lentes-contato-tipos-optimized-1200w.webp'
  ];

  let selectedImage = null;
  let imagePath = null;

  for (const img of imageOptions) {
    const testPath = path.join(__dirname, '..', 'public', 'Blog', img);
    if (fs.existsSync(testPath)) {
      selectedImage = img;
      imagePath = testPath;
      console.log(`✅ Found image: ${img}`);
      break;
    }
  }

  if (!imagePath) {
    console.error('❌ No suitable image found');
    process.exit(1);
  }

  // Upload new image
  console.log(`📤 Uploading ${selectedImage}...`);
  const imageBuffer = fs.readFileSync(imagePath);
  const asset = await sanityClient.assets.upload('image', imageBuffer, {
    filename: selectedImage
  });

  console.log(`✅ Image uploaded: ${asset._id}`);

  // Find the post
  const post = await sanityClient.fetch(
    `*[_type == "blogPost" && slug.current == "lentes-contato-iniciantes-guia-completo"][0] { _id, title }`
  );

  if (!post) {
    console.error('❌ Post not found');
    process.exit(1);
  }

  console.log(`📝 Post found: ${post.title}`);

  // Update post with correct image
  console.log('🔗 Updating post...');
  await sanityClient
    .patch(post._id)
    .set({
      mainImage: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id
        },
        alt: post.title
      }
    })
    .commit();

  console.log('✅ Post updated successfully!');
  console.log(`\n🎯 Image corrected: ${selectedImage}`);
  console.log('\n🔄 Clear browser cache and verify at:');
  console.log('   https://saraivavision.com.br/blog/lentes-contato-iniciantes-guia-completo');
}

fixImage().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
