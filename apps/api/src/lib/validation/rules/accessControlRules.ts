import { randomUUID } from 'crypto'
import type { TopologySnapshot, ValidationResult } from '@gridhive/shared'

function makeResult(
  severity: ValidationResult['severity'],
  code: string,
  title: string,
  description: string,
  recommendation: string,
  affectedNodeIds: string[],
  affectedEdgeIds: string[] = [],
): ValidationResult {
  return { id: randomUUID(), severity, code, title, description, recommendation, affectedNodeIds, affectedEdgeIds }
}

const AC_DEVICE_TYPES = new Set([
  'ac-server', 'ac-controller', 'ac-reader', 'ac-door-hardware',
  'ac-intercom', 'ac-biometric', 'ac-key-pad', 'ac-visitor-kiosk',
  'ac-elevator-ctrl', 'ac-turnstile',
])

const CLOUD_AC_PLATFORMS = new Set(['brivo', 'kisi', 'lenel-elements', 'openpath'])

function isAcDevice(nodeType: string): boolean {
  return AC_DEVICE_TYPES.has(nodeType)
}

function isCloudAcDevice(node: { data: Record<string, unknown> }): boolean {
  const platform = String(node.data.acPlatform || '')
  const cloudManaged = Boolean(node.data.cloudManaged)
  return cloudManaged || CLOUD_AC_PLATFORMS.has(platform)
}

export function runAccessControlRules(topology: TopologySnapshot): ValidationResult[] {
  const results: ValidationResult[] = []
  const { nodes, edges } = topology

  const acNodes = nodes.filter(n => isAcDevice(n.type))
  if (acNodes.length === 0) return results

  const acControllers = nodes.filter(n => n.type === 'ac-controller')
  const acServers = nodes.filter(n => n.type === 'ac-server')
  const acReaders = nodes.filter(n => n.type === 'ac-reader' || n.type === 'ac-biometric' || n.type === 'ac-key-pad')
  const cloudAcDevices = acNodes.filter(n => isCloudAcDevice(n as unknown as { data: Record<string, unknown> }))

  // ----------------------------------------------------------------
  // AC_NO_DEDICATED_VLAN
  // Severity: warning
  // AC devices share VLAN with workstations or cameras
  // ----------------------------------------------------------------
  const workstationNodes = nodes.filter(n => n.type === 'workstation')
  const cameraNodes = nodes.filter(n => n.type === 'camera')

  for (const acNode of acNodes) {
    const acVlan = acNode.data.vlanId
    if (!acVlan) continue

    const sharingWorkstations = workstationNodes.filter(n => n.data.vlanId === acVlan)
    const sharingCameras = cameraNodes.filter(n => n.data.vlanId === acVlan)
    const sharingNodes = [...sharingWorkstations, ...sharingCameras]

    if (sharingNodes.length > 0) {
      results.push(makeResult(
        'warning',
        'AC_NO_DEDICATED_VLAN',
        'Access Control Devices Share VLAN with Other Devices',
        `Access control device ${acNode.data.hostname} (VLAN ${acVlan}) shares its VLAN with ${sharingNodes.map(n => n.data.hostname).join(', ')}.`,
        'Place access control devices on a dedicated VLAN (e.g., VLAN 50 AC-CTRL) isolated from workstations and cameras.',
        [acNode.id, ...sharingNodes.map(n => n.id)],
      ))
    }
  }

  // ----------------------------------------------------------------
  // AC_CONTROLLER_NO_SERVER_PATH
  // Severity: error
  // AC controller exists but no AC server or cloud gateway reachable
  // ----------------------------------------------------------------
  for (const controller of acControllers) {
    const controllerEdges = edges.filter(e => e.source === controller.id || e.target === controller.id)
    const connectedNodeIds = controllerEdges.map(e => e.source === controller.id ? e.target : e.source)
    const connectedNodes = connectedNodeIds.map(id => nodes.find(n => n.id === id)).filter(Boolean)

    // Check if any path leads to an AC server or cloud AC
    const hasServerPath = acServers.length > 0 || isCloudAcDevice(controller as unknown as { data: Record<string, unknown> })
    const hasDirectSwitchUplink = connectedNodes.some(n => n && (n.type === 'switch-l2' || n.type === 'switch-l3'))

    if (!hasServerPath && !hasDirectSwitchUplink) {
      results.push(makeResult(
        'error',
        'AC_CONTROLLER_NO_SERVER_PATH',
        'AC Controller Has No Server Path',
        `Access control controller ${controller.data.hostname} has no reachable AC server or cloud gateway.`,
        'Ensure the AC controller has a routed network path to its AC management server, or verify cloud AC connectivity through the internet path.',
        [controller.id],
      ))
    }
  }

  // ----------------------------------------------------------------
  // AC_SERVER_NO_REDUNDANCY
  // Severity: warning
  // On-prem AC server has only one network uplink
  // ----------------------------------------------------------------
  for (const server of acServers) {
    const cloudManaged = Boolean(server.data.cloudManaged)
    if (cloudManaged) continue // Cloud AC servers don't need local redundancy

    const serverEdges = edges.filter(e => e.source === server.id || e.target === server.id)
    if (serverEdges.length < 2) {
      results.push(makeResult(
        'warning',
        'AC_SERVER_NO_REDUNDANCY',
        'On-Premises AC Server Has Single Uplink',
        `Access control server ${server.data.hostname} has only one network connection. If this link fails, all access control devices lose management connectivity.`,
        'Add a second network uplink to the AC server, or implement a redundant AC server. AC server loss can lock all doors in fail-secure mode.',
        [server.id],
        serverEdges.map(e => e.id),
      ))
    }
  }

  // ----------------------------------------------------------------
  // AC_CLOUD_NO_INTERNET
  // Severity: error
  // Cloud AC devices present but no internet path from their segment
  // ----------------------------------------------------------------
  if (cloudAcDevices.length > 0) {
    const internetNode = nodes.find(n => n.type === 'internet')
    const firewallNodes = nodes.filter(n => n.type === 'firewall' || n.type === 'firewall-edge')

    if (!internetNode) {
      results.push(makeResult(
        'error',
        'AC_CLOUD_NO_INTERNET',
        'Cloud AC Devices Have No Internet Path',
        `Cloud-managed access control devices (${cloudAcDevices.map(n => n.data.hostname).join(', ')}) require reliable internet connectivity but no internet node is present in the topology.`,
        'Cloud AC systems (Brivo, Kisi, Lenel Elements) require stable internet access. Add an internet node and ensure the AC VLAN has a routed path through the firewall to the internet.',
        cloudAcDevices.map(n => n.id),
      ))
    } else if (firewallNodes.length === 0) {
      results.push(makeResult(
        'error',
        'AC_CLOUD_NO_INTERNET',
        'Cloud AC VLAN Has No Firewall Internet Path',
        `Cloud-managed access control devices are present but no firewall separates the AC segment from the internet.`,
        'Route the AC VLAN through a firewall to the internet. Cloud AC requires reliable outbound connectivity on HTTPS port 443.',
        cloudAcDevices.map(n => n.id),
      ))
    }
  }

  // ----------------------------------------------------------------
  // AC_CONTROLLER_POE_BUDGET
  // Severity: warning
  // AC controller PoE draw may exceed switch PoE budget
  // ----------------------------------------------------------------
  const switchNodes = nodes.filter(n => n.type === 'switch-l2' || n.type === 'switch-l3')

  for (const switchNode of switchNodes) {
    const switchEdges = edges.filter(e =>
      (e.source === switchNode.id || e.target === switchNode.id) && e.data.poe === true
    )

    const connectedAcControllers = switchEdges.map(e => {
      const connectedId = e.source === switchNode.id ? e.target : e.source
      return nodes.find(n => n.id === connectedId && n.type === 'ac-controller')
    }).filter(Boolean)

    // Each AC controller typically draws 12-15W PoE
    const estimatedAcPoeWatts = connectedAcControllers.length * 15
    const switchPoeWatts = Number(switchNode.data.poeWatts || 0)

    if (connectedAcControllers.length > 0 && switchPoeWatts > 0 && estimatedAcPoeWatts > switchPoeWatts * 0.9) {
      results.push(makeResult(
        'warning',
        'AC_CONTROLLER_POE_BUDGET',
        'AC Controllers May Exceed Switch PoE Budget',
        `Switch ${switchNode.data.hostname} has ${connectedAcControllers.length} AC controllers drawing an estimated ${estimatedAcPoeWatts}W PoE, which may exceed or approach the ${switchPoeWatts}W PoE budget.`,
        'Verify PoE draw of each AC controller. Consider adding a midspan PoE injector or moving some controllers to a dedicated PoE switch.',
        [switchNode.id, ...connectedAcControllers.filter(Boolean).map(n => n!.id)],
      ))
    }
  }

  // ----------------------------------------------------------------
  // AC_READER_NO_CONTROLLER
  // Severity: error
  // AC reader has no connection to an AC controller
  // ----------------------------------------------------------------
  for (const reader of acReaders) {
    const readerEdges = edges.filter(e => e.source === reader.id || e.target === reader.id)
    const connectedNodeIds = readerEdges.map(e => e.source === reader.id ? e.target : e.source)
    const hasControllerConnection = connectedNodeIds.some(id => {
      const node = nodes.find(n => n.id === id)
      return node && (node.type === 'ac-controller' || node.type === 'ac-server')
    })

    if (!hasControllerConnection) {
      results.push(makeResult(
        'error',
        'AC_READER_NO_CONTROLLER',
        'AC Reader Not Connected to Controller',
        `Access control reader ${reader.data.hostname} has no connection to an AC controller or server.`,
        'Connect each reader to its parent door controller via a direct edge. Readers communicate via Wiegand or OSDP to the door controller.',
        [reader.id],
        readerEdges.map(e => e.id),
      ))
    }
  }

  return results
}
