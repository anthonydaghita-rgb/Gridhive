// apps/api/src/lib/simulation/IsolationChecker.ts
import type { TopologySnapshot } from '@gridhive/shared'
import type { AdjacencyGraph } from './GraphBuilder.js'
import { ReachabilityChecker } from './ReachabilityChecker.js'
import type { ReachabilityResult } from './ReachabilityChecker.js'

export interface IsolationResult {
  isolated: boolean       // true = PASS (cannot communicate = good for isolation test)
  exposed: boolean        // true = FAIL (CAN communicate = bad for isolation test)
  reachabilityResult: ReachabilityResult
  warnings: string[]
}

export class IsolationChecker {
  private reachabilityChecker = new ReachabilityChecker()

  check(
    topology: TopologySnapshot,
    graph: AdjacencyGraph,
    sourceId: string,
    targetId: string,
  ): IsolationResult {
    // Isolation test: PASSES when devices CANNOT reach each other
    const reachabilityResult = this.reachabilityChecker.check(topology, graph, sourceId, targetId)

    const warnings = [...reachabilityResult.warnings]

    if (reachabilityResult.reachable) {
      // Traffic CAN cross - this is a FAIL for isolation
      warnings.push(`EXPOSED: ${this.getNodeLabel(topology, sourceId)} can reach ${this.getNodeLabel(topology, targetId)}. These segments are NOT properly isolated.`)
    }

    return {
      isolated: !reachabilityResult.reachable,
      exposed: reachabilityResult.reachable,
      reachabilityResult,
      warnings,
    }
  }

  private getNodeLabel(topology: TopologySnapshot, nodeId: string): string {
    const node = topology.nodes.find(n => n.id === nodeId)
    return node ? (node.data.label || node.data.hostname) : nodeId
  }
}
