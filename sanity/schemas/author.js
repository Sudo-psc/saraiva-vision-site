export default {
  name: 'author',
  type: 'document',
  title: 'Author',
  fields: [
    {
      name: 'name',
      type: 'string',
      title: 'Name',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'name',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'image',
      type: 'image',
      title: 'Image',
      options: {
        hotspot: true
      }
    },
    {
      name: 'bio',
      type: 'text',
      title: 'Bio',
      rows: 4
    },
    {
      name: 'credentials',
      type: 'string',
      title: 'Credentials',
      description: 'Ex: CRM 12345 - Oftalmologista'
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'credentials',
      media: 'image'
    }
  }
}
