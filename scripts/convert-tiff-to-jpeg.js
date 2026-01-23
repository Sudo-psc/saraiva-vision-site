
import sharp from 'sharp';
import path from 'path';

const inputFile = 'saraiva-vision-site/public/icone_olho_seco.tiff';
const outputFile = 'saraiva-vision-site/public/icone_olho_seco.jpeg';

async function convertTiffToJpeg() {
  try {
    await sharp(inputFile)
      .jpeg({ quality: 90 })
      .toFile(outputFile);
    console.log(`Successfully converted ${inputFile} to ${outputFile}`);
  } catch (error) {
    console.error('Error converting image:', error);
  }
}

convertTiffToJpeg();
