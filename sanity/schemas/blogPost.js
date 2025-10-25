export default {
  name: 'blogPost',
  type: 'document',
  title: 'Blog Post',
  fields: [
    {
      name: 'id',
      type: 'number',
      title: 'ID',
      description: 'ID numérico do post (para compatibilidade com sistema antigo)',
      validation: Rule => Rule.required().integer().positive()
    },
    {
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: Rule => Rule.required().max(100)
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'excerpt',
      type: 'text',
      title: 'Excerpt',
      description: 'Resumo curto do post (aparece em listagens)',
      rows: 3,
      validation: Rule => Rule.required().max(200)
    },
    {
      name: 'content',
      type: 'blockContent',
      title: 'Content',
      description: 'Conteúdo principal do post',
      validation: Rule => Rule.required()
    },
    {
      name: 'htmlContent',
      type: 'text',
      title: 'HTML Content (Legacy)',
      description: 'Conteúdo HTML original (para migração)',
      rows: 10,
      hidden: true
    },
    {
      name: 'mainImage',
      type: 'image',
      title: 'Main Image',
      description: 'Imagem de capa do post',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          validation: Rule => Rule.required()
        }
      ],
      validation: Rule => Rule.required()
    },
    {
      name: 'legacyImageUrl',
      type: 'string',
      title: 'Legacy Image URL',
      description: 'URL da imagem no sistema antigo (para referência)',
      hidden: true
    },
    {
      name: 'author',
      type: 'reference',
      title: 'Author',
      to: [{type: 'author'}],
      validation: Rule => Rule.required()
    },
    {
      name: 'category',
      type: 'reference',
      title: 'Category',
      to: [{type: 'category'}],
      validation: Rule => Rule.required()
    },
    {
      name: 'tags',
      type: 'array',
      title: 'Tags',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      },
      validation: Rule => Rule.required().min(1)
    },
    {
      name: 'publishedAt',
      type: 'datetime',
      title: 'Published at',
      validation: Rule => Rule.required()
    },
    {
      name: 'seo',
      type: 'seo',
      title: 'SEO',
      description: 'Configurações de SEO para este post'
    },
    {
      name: 'featured',
      type: 'boolean',
      title: 'Featured',
      description: 'Destacar este post na página inicial',
      initialValue: false
    },
    {
      name: 'relatedPosts',
      type: 'array',
      title: 'Related Posts',
      description: 'Posts relacionados',
      of: [{
        type: 'reference',
        to: [{type: 'blogPost'}]
      }],
      validation: Rule => Rule.max(3)
    },
    {
      name: 'relatedPodcasts',
      type: 'array',
      title: 'Related Podcasts',
      description: 'IDs dos podcasts relacionados (migração)',
      of: [{type: 'number'}],
      hidden: true
    }
  ],
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [
        {field: 'publishedAt', direction: 'desc'}
      ]
    },
    {
      title: 'Published Date, Old',
      name: 'publishedAtAsc',
      by: [
        {field: 'publishedAt', direction: 'asc'}
      ]
    },
    {
      title: 'Title, A-Z',
      name: 'titleAsc',
      by: [
        {field: 'title', direction: 'asc'}
      ]
    }
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
      publishedAt: 'publishedAt'
    },
    prepare(selection) {
      const {author, publishedAt} = selection
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString('pt-BR') : 'No date'
      return {
        ...selection,
        subtitle: `${author} - ${date}`
      }
    }
  }
}
