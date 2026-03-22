/**
 * Singleton in-memory store for live config overrides.
 * Survives the process but resets on restart — for persistent overrides,
 * upload a file to config/ which is re-processed on startup.
 */

export interface RuleOverride {
  enabled?: boolean
  severity?: 'error' | 'warning' | 'info'
}

class ConfigStore {
  private validationRules: Map<string, RuleOverride> = new Map()

  setValidationRules(rules: Record<string, RuleOverride>) {
    for (const [ruleId, override] of Object.entries(rules)) {
      const existing = this.validationRules.get(ruleId) ?? {}
      this.validationRules.set(ruleId, { ...existing, ...override })
    }
  }

  getRuleOverride(ruleId: string): RuleOverride {
    return this.validationRules.get(ruleId) ?? {}
  }

  isRuleEnabled(ruleId: string): boolean {
    const override = this.validationRules.get(ruleId)
    return override?.enabled !== false // enabled by default
  }

  getAllRuleOverrides(): Record<string, RuleOverride> {
    return Object.fromEntries(this.validationRules.entries())
  }

  reset() {
    this.validationRules.clear()
  }
}

export const configStore = new ConfigStore()
