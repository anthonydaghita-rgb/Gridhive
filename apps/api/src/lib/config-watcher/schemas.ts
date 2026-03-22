import { z } from 'zod'
import { TopologySnapshotSchema, SimulationTestSchema } from '@gridhive/shared'

export const TemplateUploadSchema = z.object({
  type: z.literal('template'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  tags: z.array(z.string()).default([]),
  topology: TopologySnapshotSchema,
  simTestSuite: z.array(SimulationTestSchema).default([]),
})

export const ValidationConfigSchema = z.object({
  type: z.literal('validation-config'),
  rules: z.record(
    z.object({
      enabled: z.boolean().optional(),
      severity: z.enum(['error', 'warning', 'info']).optional(),
    })
  ),
})

export const SimSuiteUploadSchema = z.object({
  type: z.literal('sim-suite'),
  templateSlug: z.string().min(1),
  tests: z.array(SimulationTestSchema),
})

export const ConfigPayloadSchema = z.discriminatedUnion('type', [
  TemplateUploadSchema,
  ValidationConfigSchema,
  SimSuiteUploadSchema,
])

export type TemplateUpload = z.infer<typeof TemplateUploadSchema>
export type ValidationConfig = z.infer<typeof ValidationConfigSchema>
export type SimSuiteUpload = z.infer<typeof SimSuiteUploadSchema>
export type ConfigPayload = z.infer<typeof ConfigPayloadSchema>
