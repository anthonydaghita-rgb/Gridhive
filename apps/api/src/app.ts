import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import { config } from 'dotenv'
import { resolve } from 'path'
import { ConfigWatcher } from './lib/config-watcher/ConfigWatcher.js'

declare module 'fastify' {
  interface FastifyInstance {
    configWatcher: ConfigWatcher
  }
}

config()

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    },
  })

  // Register plugins
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })

  await app.register(cookie, {
    secret: process.env.AUTH_SECRET || 'fallback-secret-32-chars-long-xyz',
  })

  // Register Prisma plugin
  await app.register(import('./plugins/prisma.js'))

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() }
  })

  // Register modules
  await app.register(import('./modules/auth/index.js'), { prefix: '/auth' })
  await app.register(import('./modules/projects/index.js'), { prefix: '' })
  await app.register(import('./modules/templates/index.js'), { prefix: '/templates' })
  await app.register(import('./modules/validation/index.js'), { prefix: '/validate' })
  await app.register(import('./modules/simulation/index.js'), { prefix: '/simulate' })
  await app.register(import('./modules/admin/index.js'), { prefix: '/admin' })
  await app.register(import('./modules/compliance/index.js'), { prefix: '/compliance' })
  await app.register(import('./modules/configexport/index.js'), { prefix: '/export' })
  await app.register(import('./modules/scout/index.js'), { prefix: '' })
  await app.register(import('./modules/scout/stream.js'), { prefix: '' })
  await app.register(import('./modules/external/index.js'), { prefix: '' })
  await app.register(import('./modules/apikeys/index.js'), { prefix: '' })
  await app.register(import('./modules/favorites/index.js'), { prefix: '' })
  // Phase 5
  await app.register(import('./modules/lateralmovement/index.js'), { prefix: '/lm' })
  await app.register(import('./modules/capacity/index.js'), { prefix: '/capacity' })
  await app.register(import('./modules/ipam/index.js'), { prefix: '/ipam' })

  // Register config watcher before listen (Fastify v5 requires decorate before start)
  await app.register(async (instance) => {
    const configDir = resolve(process.env.CONFIG_DIR || 'config')
    const watcher = new ConfigWatcher(configDir, instance.prisma, (msg) => instance.log.info(msg))
    instance.decorate('configWatcher', watcher)
    instance.addHook('onReady', async () => { watcher.start() })
    instance.addHook('onClose', async () => { await watcher.stop() })
  })

  return app
}

async function main() {
  const app = await buildApp()
  const port = parseInt(process.env.API_PORT || '3001')
  const host = process.env.API_HOST || '0.0.0.0'

  try {
    await app.listen({ port, host })
    console.log(`Gridhive API running on http://${host}:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

main()
