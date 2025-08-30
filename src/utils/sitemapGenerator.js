// Gerador de sitemap.xml dinâmico para SEO
export const generateSitemap = (blogPosts = []) => {
  const baseUrl = 'https://saraivavision.com.br';
  const currentDate = new Date().toISOString().split('T')[0];
  
  // URLs estáticas principais
  const staticUrls = [
    { url: '', priority: '1.0', changefreq: 'weekly', lastmod: currentDate },
    { url: '/lentes', priority: '0.9', changefreq: 'monthly', lastmod: currentDate },
    { url: '/podcast', priority: '0.6', changefreq: 'weekly', lastmod: currentDate },
    { url: '/artigos/catarata', priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
    { url: '/privacy', priority: '0.3', changefreq: 'yearly', lastmod: currentDate }
  ];
  
  // URLs de serviços dinâmicas
  const serviceUrls = [
    'consultas-oftalmologicas',
    'exames-de-refracao', 
    'tratamentos-especializados',
    'cirurgias-oftalmologicas',
    'acompanhamento-pediatrico',
    'laudos-especializados'
  ].map(service => ({
    url: `/servico/${service}`,
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: currentDate
  }));
  
  // URLs de blog dinâmicas (para futuro)
  const blogUrls = blogPosts.map(post => ({
    url: `/blog/${post.slug}`,
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: post.publishDate || currentDate
  }));
  
  const allUrls = [...staticUrls, ...serviceUrls, ...blogUrls];
  
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(item => `  <url>
    <loc>${baseUrl}${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return sitemapXml;
};

// Função para gerar durante o build (compatível com ES modules)
export const writeSitemapFile = async (outputPath) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const sitemapContent = generateSitemap();
    const fullPath = path.join(outputPath, 'sitemap.xml');
    
    fs.writeFileSync(fullPath, sitemapContent, 'utf8');
    console.log('✅ Sitemap.xml gerado com sucesso em:', fullPath);
  } catch (error) {
    console.warn('⚠️ Não foi possível gerar sitemap automaticamente:', error.message);
  }
};
