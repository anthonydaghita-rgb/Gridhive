import { FastifyPluginAsync } from 'fastify'
import multipart from '@fastify/multipart'
import { writeFile } from 'fs/promises'
import { resolve } from 'path'
import { requireAuth } from '../../plugins/auth.js'
import { ConfigPayloadSchema } from '../../lib/config-watcher/schemas.js'
import { configStore } from '../../lib/config-watcher/ConfigStore.js'

declare module 'fastify' {
  interface FastifyInstance {
    configWatcher?: import('../../lib/config-watcher/ConfigWatcher.js').ConfigWatcher
  }
}

const CONFIG_DIR = resolve(process.env.CONFIG_DIR || 'config')

const adminModule: FastifyPluginAsync = async (fastify) => {
  await fastify.register(multipart, {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  })

  // POST /admin/upload — accepts a JSON file and applies it live
  fastify.post('/upload', { preHandler: requireAuth }, async (request, reply) => {
    const data = await request.file()
    if (!data) {
      return reply.status(400).send({ error: 'No file provided' })
    }

    if (!data.filename.endsWith('.json')) {
      return reply.status(400).send({ error: 'Only .json files are accepted' })
    }

    const chunks: Buffer[] = []
    for await (const chunk of data.file) {
      chunks.push(chunk)
    }
    const raw = Buffer.concat(chunks).toString('utf-8')

    let json: unknown
    try {
      json = JSON.parse(raw)
    } catch {
      return reply.status(400).send({ error: 'Invalid JSON' })
    }

    const parsed = ConfigPayloadSchema.safeParse(json)
    if (!parsed.success) {
      return reply.status(422).send({
        error: 'Schema validation failed',
        details: parsed.error.flatten(),
      })
    }

    const payload = parsed.data

    // Persist to config dir so the watcher picks it up (and re-applies on restart)
    const subdir = payload.type === 'template'
      ? 'templates'
      : payload.type === 'validation-config'
        ? 'validation'
        : 'sim-suites'

    const slug = payload.type === 'template'
      ? payload.slug
      : payload.type === 'sim-suite'
        ? payload.templateSlug
        : `override-${Date.now()}`

    const destPath = resolve(CONFIG_DIR, subdir, `${slug}.json`)

    try {
      await writeFile(destPath, JSON.stringify(payload, null, 2), 'utf-8')
    } catch (err) {
      fastify.log.warn(`Could not persist config file to ${destPath}: ${err}`)
      // Non-fatal — still apply in memory
    }

    // Apply immediately via the watcher (which is also watching the dir, but we call directly
    // to get the result synchronously for the response)
    if (fastify.configWatcher) {
      const result = await fastify.configWatcher.processPayload(payload, `upload:${request.user!.email}`)
      return reply.send({ success: true, ...result })
    }

    return reply.send({ success: true, applied: 'Config queued (watcher not active)' })
  })

  // GET /admin/config — show current in-memory overrides
  fastify.get('/config', { preHandler: requireAuth }, async (_request, reply) => {
    return reply.send({
      data: {
        validationRules: configStore.getAllRuleOverrides(),
      },
    })
  })

  // DELETE /admin/config/validation — reset all validation overrides
  fastify.delete('/config/validation', { preHandler: requireAuth }, async (_request, reply) => {
    configStore.reset()
    return reply.send({ success: true, message: 'Validation rule overrides cleared' })
  })
}

export default adminModule
