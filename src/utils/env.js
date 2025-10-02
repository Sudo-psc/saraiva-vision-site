const envMap = {};

Object.entries(process.env).forEach(([key, value]) => {
  if (key.startsWith('NEXT_PUBLIC_')) {
    envMap[key] = value;
    const viteKey = `VITE_${key.slice('NEXT_PUBLIC_'.length)}`;
    if (!(viteKey in envMap)) {
      envMap[viteKey] = value;
    }
  }
  if (key.startsWith('VITE_')) {
    envMap[key] = value;
  }
});

envMap.MODE = process.env.NODE_ENV === 'production' ? 'production' : 'development';
envMap.PROD = process.env.NODE_ENV === 'production';
envMap.DEV = process.env.NODE_ENV !== 'production';

export const env = envMap;
