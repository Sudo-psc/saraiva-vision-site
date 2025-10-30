import { sanityClient } from '../lib/sanityClient.js'
import { urlFor } from '../lib/sanityUtils.js'

const metadataProjection = `{
  _id,
  id,
  title,
  "slug": slug.current,
  excerpt,
  "author": author->name,
  "authorDetails": author->{name, credentials, image},
  "category": category->title,
  "categorySlug": category->slug.current,
  tags,
  publishedAt,
  seo,
  featured,
  mainImage,
  legacyImageUrl,
  "plainText": pt::text(content)
}`

const fullPostProjection = `{
  _id,
  id,
  title,
  "slug": slug.current,
  excerpt,
  content,
  htmlContent,
  "author": author->name,
  "authorDetails": author->{name, credentials, image},
  "category": category->title,
  "categorySlug": category->slug.current,
  tags,
  publishedAt,
  seo,
  featured,
  mainImage,
  legacyImageUrl,
  relatedPosts[]->${metadataProjection},
  relatedPodcasts,
  "plainText": pt::text(content)
}`

const calculateReadingTime = plainText => {
  if (!plainText) return 4
  const words = plainText.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

const mapSanityPost = (doc, {includeContent = false} = {}) => {
  if (!doc) return null
  const plainText = doc.plainText || ''
  const imageUrl = doc.mainImage ? urlFor(doc.mainImage).width(1200).quality(85).url() : doc.legacyImageUrl || null
  const imageAlt = doc.mainImage?.alt || doc.title
  const slugValue = typeof doc.slug === 'string' ? doc.slug : doc.slug?.current
  const base = {
    _id: doc._id,
    id: doc.id ?? doc._id,
    slug: slugValue,
    title: doc.title,
    excerpt: doc.excerpt,
    author: doc.author || doc.authorDetails?.name || 'Clínica Saraiva Vision',
    authorDetails: doc.authorDetails || null,
    category: doc.category,
    categorySlug: doc.categorySlug,
    tags: doc.tags || [],
    date: doc.publishedAt,
    publishedAt: doc.publishedAt,
    seo: doc.seo || {},
    featured: doc.featured || false,
    image: imageUrl,
    imageAlt,
    coverImage: doc.mainImage || null,
    legacyImageUrl: doc.legacyImageUrl || null,
    readingTimeMinutes: calculateReadingTime(plainText)
  }
  if (includeContent) {
    base.content = doc.content || []
    base.htmlContent = doc.htmlContent || ''
    base.relatedPosts = Array.isArray(doc.relatedPosts)
      ? doc.relatedPosts.map(item => mapSanityPost(item)).filter(Boolean)
      : []
    base.relatedPodcasts = Array.isArray(doc.relatedPodcasts) ? doc.relatedPodcasts : []
  }
  return base
}

export const fetchAllPosts = async () => {
  try {
    const result = await sanityClient.fetch(`*[_type == "blogPost"] | order(publishedAt desc) ${metadataProjection}`)
    return Array.isArray(result) ? result.map(doc => mapSanityPost(doc)) : []
  } catch (error) {
    return []
  }
}

export const fetchRecentPosts = async (limit = 3) => {
  try {
    const parsedLimit = Number.parseInt(limit, 10)
    const safeLimit = Math.max(1, Math.min(Number.isFinite(parsedLimit) ? parsedLimit : 3, 12))
    const result = await sanityClient.fetch(`*[_type == "blogPost"] | order(publishedAt desc) [0...${safeLimit}] ${metadataProjection}`)
    return Array.isArray(result) ? result.map(doc => mapSanityPost(doc)) : []
  } catch (error) {
    return []
  }
}

export const fetchPostBySlug = async slug => {
  if (!slug) return null
  try {
    const result = await sanityClient.fetch(`*[_type == "blogPost" && slug.current == $slug][0] ${fullPostProjection}`, {slug})
    return mapSanityPost(result, {includeContent: true})
  } catch (error) {
    return null
  }
}

export const fetchPostsByCategory = async category => {
  try {
    if (!category || category === 'Todas') return await fetchAllPosts()
    const result = await sanityClient.fetch(`*[_type == "blogPost" && category->title == $category] | order(publishedAt desc) ${metadataProjection}`, {category})
    return Array.isArray(result) ? result.map(doc => mapSanityPost(doc)) : []
  } catch (error) {
    return []
  }
}

export default {
  fetchAllPosts,
  fetchRecentPosts,
  fetchPostBySlug,
  fetchPostsByCategory
}
