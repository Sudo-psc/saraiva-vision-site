self.addEventListener('message', async (e) => {
  const { type, data } = e.data;

  switch (type) {
    case 'OPTIMIZE_IMAGE':
      try {
        const optimized = await optimizeImage(data);
        self.postMessage({ type: 'OPTIMIZE_SUCCESS', data: optimized });
      } catch (error) {
        self.postMessage({ type: 'OPTIMIZE_ERROR', error: error.message });
      }
      break;

    case 'BATCH_OPTIMIZE':
      try {
        const results = await Promise.all(
          data.images.map(img => optimizeImage(img))
        );
        self.postMessage({ type: 'BATCH_SUCCESS', data: results });
      } catch (error) {
        self.postMessage({ type: 'BATCH_ERROR', error: error.message });
      }
      break;

    case 'VALIDATE_IMAGE':
      try {
        const validation = await validateImage(data);
        self.postMessage({ type: 'VALIDATION_SUCCESS', data: validation });
      } catch (error) {
        self.postMessage({ type: 'VALIDATION_ERROR', error: error.message });
      }
      break;

    default:
      self.postMessage({ type: 'UNKNOWN_COMMAND', error: 'Unknown command type' });
  }
});

async function optimizeImage(imageData) {
  const { src, width, height, quality = 0.8 } = imageData;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        src,
        optimized: true,
        originalSize: imageData.size || 0,
        newSize: Math.round((imageData.size || 0) * quality),
        savings: Math.round(((imageData.size || 0) * (1 - quality))),
        timestamp: Date.now()
      });
    }, 100);
  });
}

async function validateImage(imageData) {
  const { src, maxSize = 500000 } = imageData;

  const size = imageData.size || 0;
  const isValid = size <= maxSize;
  const isMedical = src.includes('medical') || src.includes('doctor') || src.includes('clinic');

  return {
    valid: isValid,
    size,
    maxSize,
    isMedical,
    recommendation: !isValid ? `Image size ${size} exceeds maximum ${maxSize}. Consider compression.` : 'Image size is acceptable',
    timestamp: Date.now()
  };
}
