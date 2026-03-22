// apps/api/src/lib/simulation/SimulationEngine.ts
import type { TopologySnapshot, SimulationTest, SimulationResult } from '@gridhive/shared'
import { GraphBuilder } from './GraphBuilder.js'
import { ReachabilityChecker } from './ReachabilityChecker.js'
import { IsolationChecker } from './IsolationChecker.js'
import { PathTracer } from './PathTracer.js'

export class SimulationEngine {
  private graphBuilder = new GraphBuilder()
  private reachabilityChecker = new ReachabilityChecker()
  private isolationChecker = new IsolationChecker()
  private pathTracer = new PathTracer()

  run(topology: TopologySnapshot, tests: SimulationTest[]): SimulationResult[] {
    const graph = this.graphBuilder.build(topology)
    const results: SimulationResult[] = []

    for (const test of tests) {
      const result = this.runTest(topology, graph, test)
      results.push(result)
    }

    return results
  }

  private runTest(
    topology: TopologySnapshot,
    graph: ReturnType<GraphBuilder['build']>,
    test: SimulationTest,
  ): SimulationResult {
    switch (test.type) {
      case 'reachability':
        return this.runReachabilityTest(topology, graph, test)

      case 'isolation':
        return this.runIsolationTest(topology, graph, test)

      case 'path-trace':
        return this.runPathTraceTest(topology, graph, test)

      case 'internet-access':
        return this.runInternetAccessTest(topology, graph, test)

      case 'redundancy-failover':
        return this.runRedundancyTest(topology, graph, test)

      default:
        return {
          testId: test.id,
          passed: false,
          path: [],
          blockReason: `Unknown test type: ${(test as SimulationTest).type}`,
          warnings: [],
        }
    }
  }

  private runReachabilityTest(
    topology: TopologySnapshot,
    graph: ReturnType<GraphBuilder['build']>,
    test: SimulationTest,
  ): SimulationResult {
    const result = this.reachabilityChecker.check(topology, graph, test.sourceNodeId, test.targetNodeId)

    const passed = test.expectedResult === 'pass' ? result.reachable : !result.reachable

    return {
      testId: test.id,
      passed,
      path: result.path,
      blockedAt: result.blockedAt,
      blockReason: result.blockReason,
      warnings: result.warnings,
    }
  }

  private runIsolationTest(
    topology: TopologySnapshot,
    graph: ReturnType<GraphBuilder['build']>,
    test: SimulationTest,
  ): SimulationResult {
    const result = this.isolationChecker.check(topology, graph, test.sourceNodeId, test.targetNodeId)

    // For isolation test: expectedResult 'pass' means devices should be isolated
    const passed = test.expectedResult === 'pass' ? result.isolated : result.exposed

    const warnings = [...result.warnings]
    if (result.exposed) {
      warnings.unshift(`ISOLATION FAILED: Devices can communicate. If isolation is required, add VLAN segmentation or firewall rules.`)
    } else {
      warnings.unshift(`ISOLATION VERIFIED: Devices cannot communicate. Segments are properly isolated.`)
    }

    return {
      testId: test.id,
      passed,
      path: result.reachabilityResult.path,
      blockedAt: result.reachabilityResult.blockedAt,
      blockReason: result.reachabilityResult.blockReason,
      warnings,
    }
  }

  private runPathTraceTest(
    topology: TopologySnapshot,
    graph: ReturnType<GraphBuilder['build']>,
    test: SimulationTest,
  ): SimulationResult {
    const result = this.pathTracer.trace(topology, graph, test.sourceNodeId, test.targetNodeId)

    const passed = test.expectedResult === 'pass' ? result.reachable : !result.reachable

    return {
      testId: test.id,
      passed,
      path: result.path,
      blockedAt: result.blockedAt,
      blockReason: result.blockReason,
      warnings: result.warnings,
    }
  }

  private runInternetAccessTest(
    topology: TopologySnapshot,
    graph: ReturnType<GraphBuilder['build']>,
    test: SimulationTest,
  ): SimulationResult {
    // Find internet node
    const internetNode = topology.nodes.find(n => n.type === 'internet')
    if (!internetNode) {
      return {
        testId: test.id,
        passed: test.expectedResult === 'fail',
        path: [],
        blockReason: 'No internet node found in topology.',
        warnings: ['Add an internet node to model internet connectivity.'],
      }
    }

    const targetId = test.targetNodeId === '' ? internetNode.id : test.targetNodeId

    const result = this.reachabilityChecker.check(topology, graph, test.sourceNodeId, targetId)

    const warnings = [...result.warnings]

    // Check if path includes a firewall
    const pathIncludesFirewall = result.path.some(hop =>
      hop.deviceType === 'firewall' || hop.deviceType === 'firewall-edge'
    )

    if (result.reachable && !pathIncludesFirewall) {
      warnings.push('WARNING: Internet access achieved but no firewall detected in path. Traffic is unrestricted from internet to LAN. This is a security risk.')
    }

    const passed = test.expectedResult === 'pass' ? result.reachable : !result.reachable

    return {
      testId: test.id,
      passed,
      path: result.path,
      blockedAt: result.blockedAt,
      blockReason: result.blockReason,
      warnings,
    }
  }

  private runRedundancyTest(
    topology: TopologySnapshot,
    graph: ReturnType<GraphBuilder['build']>,
    test: SimulationTest,
  ): SimulationResult {
    // Step 1: Run standard path trace
    const primaryResult = this.reachabilityChecker.check(topology, graph, test.sourceNodeId, test.targetNodeId)

    if (!primaryResult.reachable) {
      return {
        testId: test.id,
        passed: false,
        path: primaryResult.path,
        blockReason: 'Primary path is not reachable. Cannot test failover.',
        warnings: primaryResult.warnings,
      }
    }

    // Step 2: Find the most critical node in the path (first infrastructure hop)
    const criticalHop = primaryResult.path.find(hop => {
      return hop.deviceType === 'switch-l2' || hop.deviceType === 'switch-l3' ||
             hop.deviceType === 'router' || hop.deviceType === 'firewall'
    })

    if (!criticalHop) {
      return {
        testId: test.id,
        passed: false,
        path: primaryResult.path,
        blockReason: 'No critical infrastructure node found in path to simulate failure.',
        warnings: primaryResult.warnings,
      }
    }

    // Step 3: Simulate failure of critical node
    const failureGraph = this.graphBuilder.buildWithFailure(topology, criticalHop.nodeId)
    const failoverResult = this.reachabilityChecker.check(topology, failureGraph, test.sourceNodeId, test.targetNodeId)

    const warnings = [...primaryResult.warnings]

    if (failoverResult.reachable) {
      warnings.push(`FAILOVER SUCCESS: When ${criticalHop.nodeLabel} fails, traffic reroutes through an alternate path.`)
    } else {
      warnings.push(`SINGLE POINT OF FAILURE: When ${criticalHop.nodeLabel} fails, there is no alternate path. Consider adding redundancy.`)
    }

    const passed = test.expectedResult === 'pass' ? failoverResult.reachable : !failoverResult.reachable

    return {
      testId: test.id,
      passed,
      path: primaryResult.path,
      blockedAt: failoverResult.reachable ? undefined : criticalHop.nodeId,
      blockReason: failoverResult.reachable ? undefined : `SINGLE POINT OF FAILURE: No alternate path when ${criticalHop.nodeLabel} is down.`,
      warnings,
      failoverPath: failoverResult.reachable ? failoverResult.path : undefined,
    }
  }
}
