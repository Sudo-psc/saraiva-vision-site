import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import { glob } from 'glob';
import { statSync, unlinkSync, renameSync, mkdirSync, existsSync } from 'fs';
import { dirname, join, basename } from 'path';

const source = 'public/images/src/**/*.{png,jpg,jpeg}';
const destination = 'public/images/dist';

const checkMode = process.argv.includes('check');

(async () => {
  const files = await glob(source);

  if (checkMode) {
    console.log('Images that would be optimized:');
    files.forEach(file => console.log(file));
    return;
  }

  console.log('Optimizing images...');

  for (const file of files) {
    try {
      const stats = statSync(file);
      if (stats.size > 500 * 1024) { // Only optimize files larger than 500KB
        console.log(`Optimizing ${file}...`);

        const output = await imagemin([file], {
          destination: dirname(file),
          plugins: [
            imageminWebp({ quality: 80 })
          ]
        });

        if (output.length > 0) {
          const newPath = output[0].destinationPath.replace('/src/', '/dist/');
          renameSync(output[0].sourcePath, newPath);
          console.log(`Optimized and moved to ${newPath}`);
        }
      }
    } catch (error) {
      console.error(`Error optimizing ${file}:`, error);
    }
  }

  console.log('Image optimization complete.');
})();