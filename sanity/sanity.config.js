import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas/index.js'

export default defineConfig({
  name: 'saraiva-vision-blog',
  title: 'Saraiva Vision Blog',

  projectId: '92ocrdmp',
  dataset: 'production',

  basePath: '/',
  
  apiVersion: '2024-01-01',

  plugins: [
    structureTool(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
