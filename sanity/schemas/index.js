import blockContent from './blockContent.js'
import category from './category.js'
import author from './author.js'
import blogPost from './blogPost.js'
import seo from './seo.js'

export const schemaTypes = [
  // Object types
  seo,
  blockContent,

  // Document types
  author,
  category,
  blogPost
]
