/**
 * formats.registry.ts — Gridhive Phase 4 Pillar C
 *
 * Central registry of every supported config export format.
 * Each entry maps a format identifier to its generator metadata,
 * file type, apply method, and verified firmware version.
 */

// ─── ConfigFormat type ────────────────────────────────────────────────────────

export type ConfigFormat =
  | 'unifi-gateway-json'
  | 'unifi-api-script'
  | 'cisco-ios-cli'
  | 'cisco-ios-vlan'
  | 'fortios-cli'
  | 'meraki-python-sdk'
  | 'panos-set-commands'
  | 'aruba-aoss-cli'
  | 'sonicwall-cli'
  | 'watchguard-xml'
  | 'generic-summary'

// ─── Registry entry shape ─────────────────────────────────────────────────────

export type ApplyMethod =
  | 'paste-cli'
  | 'file-upload-gui'
  | 'api-push'
  | 'sdk-script'

export interface FormatRegistryEntry {
  /** Stable format identifier used in filenames and API responses */
  format: ConfigFormat
  /** Name of the TypeScript generator class/function that produces this format */
  generatorName: string
  /** Default file extension (including leading dot) */
  extension: string
  /** MIME type for HTTP Content-Type and download headers */
  mimeType: string
  /** How the generated artifact is applied to the device */
  applyMethod: ApplyMethod
  /** Firmware/OS version against which the output syntax was verified */
  verifiedFirmware: string
  /** Official vendor documentation URL for the config format */
  documentationUrl: string
  /** Human-readable description shown in the UI format picker */
  description: string
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const FORMAT_REGISTRY: FormatRegistryEntry[] = [
  // ── UniFi ──────────────────────────────────────────────────────────────────
  {
    format: 'unifi-gateway-json',
    generatorName: 'UniFiGatewayGenerator',
    extension: '.json',
    mimeType: 'application/json',
    applyMethod: 'file-upload-gui',
    verifiedFirmware: 'UniFi Network App 8.x / UDM Pro 3.x',
    documentationUrl: 'https://help.ui.com/hc/en-us/articles/215458888',
    description: 'EdgeOS-compatible config.gateway.json for UDM/USG — copy to controller and force-provision',
  },
  {
    format: 'unifi-api-script',
    generatorName: 'UniFiGatewayGenerator',
    extension: '.sh',
    mimeType: 'text/x-shellscript',
    applyMethod: 'api-push',
    verifiedFirmware: 'UniFi Network App 8.x',
    documentationUrl: 'https://ubntwiki.com/products/software/unifi-controller/api',
    description: 'Shell script that creates VLANs, SSIDs, and port profiles via the UniFi REST API',
  },

  // ── Cisco IOS ──────────────────────────────────────────────────────────────
  {
    format: 'cisco-ios-cli',
    generatorName: 'CiscoIOSGenerator',
    extension: '.txt',
    mimeType: 'text/plain',
    applyMethod: 'paste-cli',
    verifiedFirmware: 'IOS-XE 17.x',
    documentationUrl: 'https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/iproute_pi/configuration/xe-17/iri-xe-17-book.html',
    description: 'Full IOS-XE running config (interfaces, VLANs, SVIs) — paste in configure terminal mode',
  },
  {
    format: 'cisco-ios-vlan',
    generatorName: 'CiscoIOSGenerator',
    extension: '.txt',
    mimeType: 'text/plain',
    applyMethod: 'paste-cli',
    verifiedFirmware: 'IOS-XE 17.x',
    documentationUrl: 'https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-x/configuration_guide/vlan/b_173_vlan_9300_cg/configuring_vlans.html',
    description: 'VLAN database config (vtp mode transparent + vlan declarations) — paste before running config',
  },

  // ── FortiGate ──────────────────────────────────────────────────────────────
  {
    format: 'fortios-cli',
    generatorName: 'FortiGateGenerator',
    extension: '.cli.txt',
    mimeType: 'text/plain',
    applyMethod: 'paste-cli',
    verifiedFirmware: 'FortiOS 7.x',
    documentationUrl: 'https://docs.fortinet.com/document/fortigate/7.4.0/cli-reference/80022/config-system-global',
    description: 'FortiOS CLI script — paste into SSH session, run "execute cfg save"',
  },

  // ── Meraki ─────────────────────────────────────────────────────────────────
  {
    format: 'meraki-python-sdk',
    generatorName: 'MerakiGenerator',
    extension: '.py',
    mimeType: 'text/x-python',
    applyMethod: 'sdk-script',
    verifiedFirmware: 'Meraki Dashboard API v1',
    documentationUrl: 'https://developer.cisco.com/meraki/api-v1/',
    description: 'Python script using the meraki SDK — edit API_KEY/ORG_ID/NETWORK_ID then run',
  },

  // ── PAN-OS ─────────────────────────────────────────────────────────────────
  {
    format: 'panos-set-commands',
    generatorName: 'PanosGenerator',
    extension: '.set.txt',
    mimeType: 'text/plain',
    applyMethod: 'paste-cli',
    verifiedFirmware: 'PAN-OS 11.x',
    documentationUrl: 'https://docs.paloaltonetworks.com/pan-os/11-0/pan-os-admin/getting-started/get-started-with-the-cli',
    description: 'PAN-OS set commands — paste in configure mode, run "commit"',
  },

  // ── Aruba AOS-S ────────────────────────────────────────────────────────────
  {
    format: 'aruba-aoss-cli',
    generatorName: 'ArubaGenerator',
    extension: '.txt',
    mimeType: 'text/plain',
    applyMethod: 'paste-cli',
    verifiedFirmware: 'AOS-S 16.x',
    documentationUrl: 'https://www.arubanetworks.com/techdocs/AOS-S/16.11/MHG/TOC.htm',
    description: 'Aruba AOS-S CLI config — uses vlan-access/tagged vlan syntax (not Cisco)',
  },

  // ── SonicWall ──────────────────────────────────────────────────────────────
  {
    format: 'sonicwall-cli',
    generatorName: 'SonicWallGenerator',
    extension: '.txt',
    mimeType: 'text/plain',
    applyMethod: 'paste-cli',
    verifiedFirmware: 'SonicOS 7.x',
    documentationUrl: 'https://www.sonicwall.com/support/technical-documentation/docs/sonicos-7-0-cli-guide',
    description: 'SonicOS CLI commands — log in as admin, enter configure mode, paste and commit',
  },

  // ── WatchGuard ─────────────────────────────────────────────────────────────
  {
    format: 'watchguard-xml',
    generatorName: 'WatchGuardGenerator',
    extension: '.xml',
    mimeType: 'application/xml',
    applyMethod: 'file-upload-gui',
    verifiedFirmware: 'Fireware 12.10',
    documentationUrl: 'https://www.watchguard.com/help/docs/help-center/en-US/Content/en-US/Fireware/basicadmin/config_import_export_about_wsm.html',
    description: 'Fireware XML profile — import via Policy Manager > File > Import',
  },

  // ── Generic ────────────────────────────────────────────────────────────────
  {
    format: 'generic-summary',
    generatorName: 'GenericSummaryGenerator',
    extension: '.txt',
    mimeType: 'text/plain',
    applyMethod: 'paste-cli',
    verifiedFirmware: 'N/A',
    documentationUrl: '',
    description: 'Human-readable device summary — useful for documentation and manual configuration',
  },
]

// ─── Lookup helpers ────────────────────────────────────────────────────────────

/** Look up a registry entry by format identifier. Returns undefined if not found. */
export function getFormatEntry(format: ConfigFormat): FormatRegistryEntry | undefined {
  return FORMAT_REGISTRY.find(e => e.format === format)
}

/** Return all formats that use a given apply method. */
export function getFormatsByApplyMethod(method: ApplyMethod): FormatRegistryEntry[] {
  return FORMAT_REGISTRY.filter(e => e.applyMethod === method)
}

/** Return all formats produced by a specific generator. */
export function getFormatsByGenerator(generatorName: string): FormatRegistryEntry[] {
  return FORMAT_REGISTRY.filter(e => e.generatorName === generatorName)
}
