// apps/api/src/lib/simulation/PathTracer.ts
import type { TopologySnapshot, SimulationHop } from '@gridhive/shared'
import type { AdjacencyGraph } from './GraphBuilder.js'
import { ReachabilityChecker } from './ReachabilityChecker.js'

export interface PathTraceResult {
  reachable: boolean
  path: SimulationHop[]
  blockedAt?: string
  blockReason?: string
  warnings: string[]
}

export class PathTracer {
  private reachabilityChecker = new ReachabilityChecker()

  trace(
    topology: TopologySnapshot,
    graph: AdjacencyGraph,
    sourceId: string,
    targetId: string,
  ): PathTraceResult {
    const result = this.reachabilityChecker.check(topology, graph, sourceId, targetId)

    return {
      reachable: result.reachable,
      path: result.path,
      blockedAt: result.blockedAt,
      blockReason: result.blockReason,
      warnings: result.warnings,
    }
  }
}
