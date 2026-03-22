// apps/api/src/lib/simulation/SubnetCalculator.ts
// Pure TypeScript subnet/CIDR math - no external deps needed for basic operations

export class SubnetCalculator {
  /**
   * Parse CIDR notation into network components
   */
  private parseCidr(cidr: string): { ip: string; prefix: number; networkInt: number; maskInt: number } {
    const parts = cidr.split('/')
    const ip = parts[0]
    const prefix = parseInt(parts[1] || '32', 10)

    const ipInt = this.ipToInt(ip)
    const maskInt = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
    const networkInt = (ipInt & maskInt) >>> 0

    return { ip, prefix, networkInt, maskInt }
  }

  private ipToInt(ip: string): number {
    const parts = ip.split('.').map(Number)
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
      throw new Error(`Invalid IP address: ${ip}`)
    }
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
  }

  private intToIp(int: number): string {
    return [
      (int >>> 24) & 255,
      (int >>> 16) & 255,
      (int >>> 8) & 255,
      int & 255,
    ].join('.')
  }

  /**
   * Check if an IP address is within a CIDR subnet
   * @param ip - IP address (without prefix, e.g. "192.168.10.50")
   * @param cidr - CIDR notation (e.g. "192.168.10.0/24")
   */
  isInSubnet(ip: string, cidr: string): boolean {
    try {
      const cleanIp = ip.includes('/') ? ip.split('/')[0] : ip
      const { networkInt, maskInt } = this.parseCidr(cidr)
      const ipInt = this.ipToInt(cleanIp)
      return ((ipInt & maskInt) >>> 0) === networkInt
    } catch {
      return false
    }
  }

  /**
   * Check if two IPs are on the same subnet
   */
  sameSubnet(ip1: string, ip2: string, cidr: string): boolean {
    return this.isInSubnet(ip1, cidr) && this.isInSubnet(ip2, cidr)
  }

  /**
   * Check if two CIDR subnets overlap
   */
  overlaps(cidr1: string, cidr2: string): boolean {
    try {
      const a = this.parseCidr(cidr1)
      const b = this.parseCidr(cidr2)

      // Two subnets overlap if one contains the start of the other
      const aContainsB = ((b.networkInt & a.maskInt) >>> 0) === a.networkInt
      const bContainsA = ((a.networkInt & b.maskInt) >>> 0) === b.networkInt

      return aContainsB || bContainsA
    } catch {
      return false
    }
  }

  /**
   * Get the broadcast address of a subnet
   */
  broadcastAddress(cidr: string): string {
    const { networkInt, maskInt } = this.parseCidr(cidr)
    const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0
    return this.intToIp(broadcastInt)
  }

  /**
   * Get the network address of an IP/CIDR
   */
  getNetworkAddress(cidr: string): string {
    const { networkInt } = this.parseCidr(cidr)
    return this.intToIp(networkInt)
  }

  /**
   * Get the first usable host IP (network + 1, typically the gateway)
   */
  getFirstHost(cidr: string): string {
    const { networkInt } = this.parseCidr(cidr)
    return this.intToIp((networkInt + 1) >>> 0)
  }

  /**
   * Get the last usable host IP (broadcast - 1)
   */
  getLastHost(cidr: string): string {
    const { networkInt, maskInt } = this.parseCidr(cidr)
    const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0
    return this.intToIp((broadcastInt - 1) >>> 0)
  }

  /**
   * Check if an IP address is valid
   */
  isValidIp(ip: string): boolean {
    try {
      const cleanIp = ip.includes('/') ? ip.split('/')[0] : ip
      this.ipToInt(cleanIp)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if a CIDR is valid
   */
  isValidCidr(cidr: string): boolean {
    try {
      const parts = cidr.split('/')
      if (parts.length !== 2) return false
      this.ipToInt(parts[0])
      const prefix = parseInt(parts[1], 10)
      return prefix >= 0 && prefix <= 32
    } catch {
      return false
    }
  }

  /**
   * Get subnet mask string from prefix
   */
  getSubnetMask(prefix: number): string {
    if (prefix === 0) return '0.0.0.0'
    const maskInt = (~0 << (32 - prefix)) >>> 0
    return this.intToIp(maskInt)
  }

  /**
   * Get available host count in subnet
   */
  getHostCount(cidr: string): number {
    const parts = cidr.split('/')
    const prefix = parseInt(parts[1] || '32', 10)
    if (prefix >= 32) return 1
    if (prefix === 31) return 2
    return Math.pow(2, 32 - prefix) - 2
  }

  /**
   * Get the network CIDR for an IP/prefix combo
   * e.g. "192.168.10.50/24" -> "192.168.10.0/24"
   */
  getNetworkCidr(ipWithPrefix: string): string {
    const parts = ipWithPrefix.split('/')
    const prefix = parseInt(parts[1] || '32', 10)
    const networkInt = this.parseCidr(ipWithPrefix).networkInt
    return `${this.intToIp(networkInt)}/${prefix}`
  }
}
