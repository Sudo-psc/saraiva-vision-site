import blockContent from './blockContent'
import category from './category'
import author from './author'
import blogPost from './blogPost'
import seo from './seo'

export const schemaTypes = [
  // Object types
  seo,
  blockContent,

  // Document types
  author,
  category,
  blogPost
]
