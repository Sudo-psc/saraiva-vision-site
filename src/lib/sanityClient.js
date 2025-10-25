import {createClient} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: '92ocrdmp',
  dataset: 'production',
  apiVersion: '2025-10-25',
  useCdn: true
})

const builder = imageUrlBuilder(sanityClient)

export const urlFor = source => builder.image(source)

export default sanityClient
