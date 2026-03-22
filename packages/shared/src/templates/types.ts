import type { NetForgeTemplate, TemplateCategory } from '../types/index.js'

export type { NetForgeTemplate, TemplateCategory }

export interface TemplateRegistry {
  [slug: string]: NetForgeTemplate
}
