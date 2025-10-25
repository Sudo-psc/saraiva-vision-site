/**
 * Sanity.io Schema Definition for Saraiva Vision Blog Posts
 *
 * This schema mirrors the structure of blog posts currently in src/data/blogPosts.js
 * and is ready to be imported into your Sanity Studio.
 *
 * @author Dr. Philipe Saraiva Cruz
 * @date 2025-10-25
 */

export const blogPostSchema = {
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    {
      name: 'id',
      title: 'ID',
      type: 'number',
      description: 'Unique identifier for the blog post',
      validation: Rule => Rule.required().positive().integer()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly version of the title',
      options: {
        source: 'title',
        maxLength: 200,
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Blog post title',
      validation: Rule => Rule.required().max(200)
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'Short summary of the blog post',
      rows: 3,
      validation: Rule => Rule.required().max(300)
    },
    {
      name: 'content',
      title: 'Content',
      type: 'text',
      description: 'Full HTML content of the blog post',
      validation: Rule => Rule.required()
    },
    {
      name: 'author',
      title: 'Author',
      type: 'string',
      description: 'Author name',
      initialValue: 'Dr. Philipe Saraiva Cruz',
      validation: Rule => Rule.required()
    },
    {
      name: 'date',
      title: 'Publication Date',
      type: 'date',
      description: 'Date when the post was published',
      options: {
        dateFormat: 'YYYY-MM-DD'
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Blog post category',
      options: {
        list: [
          { title: 'Dúvidas Frequentes', value: 'Dúvidas Frequentes' },
          { title: 'Tratamento', value: 'Tratamento' },
          { title: 'Prevenção', value: 'Prevenção' },
          { title: 'Tecnologia', value: 'Tecnologia' },
          { title: 'Cirurgia', value: 'Cirurgia' },
          { title: 'Saúde Ocular', value: 'Saúde Ocular' },
          { title: 'Notícias', value: 'Notícias' }
        ]
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Keywords and topics related to the post',
      options: {
        layout: 'tags'
      }
    },
    {
      name: 'image',
      title: 'Cover Image',
      type: 'string',
      description: 'Path to the cover image (e.g., /Blog/image.webp)',
      validation: Rule => Rule.required()
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Whether this post should be featured on the homepage',
      initialValue: false
    },
    {
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      description: 'SEO metadata for the blog post',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'SEO title (50-60 characters recommended)',
          validation: Rule => Rule.max(60)
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          description: 'SEO description (150-160 characters recommended)',
          rows: 3,
          validation: Rule => Rule.max(160)
        },
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'SEO keywords',
          options: {
            layout: 'tags'
          }
        }
      ]
    },
    {
      name: 'relatedPodcasts',
      title: 'Related Podcasts',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'IDs or slugs of related podcast episodes'
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'Timestamp when the post was published',
      initialValue: () => new Date().toISOString()
    },
    {
      name: 'updatedAt',
      title: 'Last Updated',
      type: 'datetime',
      description: 'Timestamp of the last update',
      readOnly: true
    }
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      media: 'image',
      date: 'date'
    },
    prepare(selection) {
      const { title, author, date } = selection
      return {
        title: title,
        subtitle: `${author} - ${date}`
      }
    }
  },
  orderings: [
    {
      title: 'Date, New',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }]
    },
    {
      title: 'Date, Old',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }]
    },
    {
      title: 'Title, A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }]
    }
  ]
}

/**
 * To use this schema in your Sanity Studio:
 *
 * 1. Copy this schema to your Sanity Studio project
 * 2. Add to schemas/index.js:
 *    import { blogPostSchema } from './blogPostSchema'
 *    export default createSchema({
 *      name: 'default',
 *      types: schemaTypes.concat([blogPostSchema])
 *    })
 *
 * 3. Deploy your Studio: sanity deploy
 */

export default blogPostSchema
