import { watch, FSWatcher } from 'chokidar'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import type { PrismaClient } from '@prisma/client'
import { ConfigPayloadSchema } from './schemas.js'
import type { ConfigPayload } from './schemas.js'
import { configStore } from './ConfigStore.js'

export class ConfigWatcher {
  private watcher: FSWatcher | null = null
  private configDir: string
  private prisma: PrismaClient
  private log: (msg: string) => void

  constructor(configDir: string, prisma: PrismaClient, logger?: (msg: string) => void) {
    this.configDir = resolve(configDir)
    this.prisma = prisma
    this.log = logger ?? ((msg) => console.log(`[ConfigWatcher] ${msg}`))
  }

  start() {
    this.watcher = watch(`${this.configDir}/**/*.json`, {
      ignoreInitial: false,
      persistent: true,
      awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
    })

    this.watcher.on('add', (path) => this.processFile(path, 'added'))
    this.watcher.on('change', (path) => this.processFile(path, 'changed'))
    this.watcher.on('error', (err) => this.log(`Watcher error: ${err}`))

    this.log(`Watching ${this.configDir}`)
  }

  async stop() {
    await this.watcher?.close()
    this.watcher = null
  }

  async processPayload(payload: ConfigPayload, source = 'upload'): Promise<{ applied: string }> {
    if (payload.type === 'template') {
      const existing = await this.prisma.template.findFirst({ where: { slug: payload.slug } })
      if (existing) {
        await this.prisma.template.update({
          where: { id: existing.id },
          data: {
            name: payload.name,
            description: payload.description,
            category: payload.category,
            difficulty: payload.difficulty,
            tags: payload.tags,
            topology: payload.topology as object,
            simTestSuite: payload.simTestSuite as object[],
          },
        })
        this.log(`[${source}] Updated template: ${payload.slug}`)
        return { applied: `Updated template "${payload.slug}"` }
      } else {
        await this.prisma.template.create({
          data: {
            name: payload.name,
            slug: payload.slug,
            description: payload.description,
            category: payload.category,
            difficulty: payload.difficulty,
            tags: payload.tags,
            topology: payload.topology as object,
            simTestSuite: payload.simTestSuite as object[],
            isSystem: false,
          },
        })
        this.log(`[${source}] Created template: ${payload.slug}`)
        return { applied: `Created template "${payload.slug}"` }
      }
    }

    if (payload.type === 'validation-config') {
      configStore.setValidationRules(payload.rules)
      this.log(`[${source}] Applied validation-config override`)
      return { applied: `Applied validation rule overrides (${Object.keys(payload.rules).length} rules)` }
    }

    if (payload.type === 'sim-suite') {
      const template = await this.prisma.template.findFirst({ where: { slug: payload.templateSlug } })
      if (!template) {
        throw new Error(`Template not found: ${payload.templateSlug}`)
      }
      const existing = (template.simTestSuite as object[]) ?? []
      const existingIds = new Set((existing as Array<{ id: string }>).map((t) => t.id))
      const merged = [
        ...existing,
        ...payload.tests.filter((t) => !existingIds.has(t.id)),
      ]
      await this.prisma.template.update({
        where: { id: template.id },
        data: { simTestSuite: merged },
      })
      this.log(`[${source}] Added ${payload.tests.length} tests to template: ${payload.templateSlug}`)
      return { applied: `Added ${payload.tests.length} sim test(s) to "${payload.templateSlug}"` }
    }

    throw new Error('Unknown payload type')
  }

  private async processFile(filePath: string, event: string) {
    try {
      const raw = await readFile(filePath, 'utf-8')
      const json = JSON.parse(raw)
      const payload = ConfigPayloadSchema.parse(json)
      await this.processPayload(payload, `file:${event}`)
    } catch (err) {
      this.log(`Failed to process ${filePath}: ${err instanceof Error ? err.message : err}`)
    }
  }
}
