export default {
  name: 'seo',
  type: 'object',
  title: 'SEO',
  fields: [
    {
      name: 'metaTitle',
      type: 'string',
      title: 'Meta Title',
      description: 'Título para SEO (60-70 caracteres)',
      validation: Rule => Rule.max(70).warning('Títulos muito longos podem ser cortados nos resultados de busca')
    },
    {
      name: 'metaDescription',
      type: 'text',
      title: 'Meta Description',
      description: 'Descrição para SEO (150-160 caracteres)',
      rows: 3,
      validation: Rule => Rule.max(160).warning('Descrições muito longas podem ser cortadas nos resultados de busca')
    },
    {
      name: 'keywords',
      type: 'array',
      title: 'Keywords',
      description: 'Palavras-chave para SEO',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      }
    },
    {
      name: 'canonicalUrl',
      type: 'url',
      title: 'Canonical URL',
      description: 'URL canônica (opcional)',
    }
  ]
}
