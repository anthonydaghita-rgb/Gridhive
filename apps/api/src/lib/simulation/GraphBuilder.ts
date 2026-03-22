// apps/api/src/lib/simulation/GraphBuilder.ts
import type { TopologySnapshot, DeviceNode, ConnectionEdge } from '@gridhive/shared'

export interface Neighbor {
  nodeId: string
  edgeId: string
  edge: ConnectionEdge
}

export type AdjacencyGraph = Map<string, Neighbor[]>

export class GraphBuilder {
  build(topology: TopologySnapshot): AdjacencyGraph {
    const graph: AdjacencyGraph = new Map()

    // Initialize all nodes
    for (const node of topology.nodes) {
      graph.set(node.id, [])
    }

    // Add edges (bidirectional)
    for (const edge of topology.edges) {
      if (edge.data.status === 'simulated-down') continue

      const sourceNeighbors = graph.get(edge.source) || []
      sourceNeighbors.push({ nodeId: edge.target, edgeId: edge.id, edge })
      graph.set(edge.source, sourceNeighbors)

      const targetNeighbors = graph.get(edge.target) || []
      targetNeighbors.push({ nodeId: edge.source, edgeId: edge.id, edge })
      graph.set(edge.target, targetNeighbors)
    }

    return graph
  }

  /**
   * Build graph with specific edges marked as down (for failover simulation)
   */
  buildWithFailure(topology: TopologySnapshot, failedNodeId: string): AdjacencyGraph {
    const modifiedTopology: TopologySnapshot = {
      ...topology,
      edges: topology.edges.map(edge => {
        if (edge.source === failedNodeId || edge.target === failedNodeId) {
          return { ...edge, data: { ...edge.data, status: 'simulated-down' as const } }
        }
        return edge
      }),
    }
    return this.build(modifiedTopology)
  }

  getNode(topology: TopologySnapshot, nodeId: string): DeviceNode | undefined {
    return topology.nodes.find(n => n.id === nodeId)
  }
}
