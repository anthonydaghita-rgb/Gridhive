import type { TopologySnapshot, ValidationResult } from '@gridhive/shared'
import { runIpRules } from './rules/ipRules.js'
import { runVlanRules } from './rules/vlanRules.js'
import { runRoutingRules } from './rules/routingRules.js'
import { runConnectivityRules } from './rules/connectivityRules.js'
import { runSecurityRules } from './rules/securityRules.js'
import { runServiceRules } from './rules/serviceRules.js'

export class ValidationEngine {
  run(topology: TopologySnapshot): ValidationResult[] {
    const results: ValidationResult[] = []

    results.push(...runIpRules(topology))
    results.push(...runVlanRules(topology))
    results.push(...runRoutingRules(topology))
    results.push(...runConnectivityRules(topology))
    results.push(...runSecurityRules(topology))
    results.push(...runServiceRules(topology))

    return results
  }
}
