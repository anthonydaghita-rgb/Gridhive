import { describe, it, expect } from 'vitest'
import { SubnetCalculator } from './SubnetCalculator.js'

const calc = new SubnetCalculator()

describe('SubnetCalculator', () => {
  describe('isInSubnet', () => {
    it('should return true for IP within subnet', () => {
      expect(calc.isInSubnet('192.168.10.50', '192.168.10.0/24')).toBe(true)
    })

    it('should return false for IP outside subnet', () => {
      expect(calc.isInSubnet('192.168.11.50', '192.168.10.0/24')).toBe(false)
    })

    it('should handle /25 subnet correctly', () => {
      expect(calc.isInSubnet('192.168.10.50', '192.168.10.0/25')).toBe(true)
      expect(calc.isInSubnet('192.168.10.150', '192.168.10.0/25')).toBe(false)
      expect(calc.isInSubnet('192.168.10.150', '192.168.10.128/25')).toBe(true)
    })

    it('should handle IP with prefix notation', () => {
      expect(calc.isInSubnet('192.168.10.50/24', '192.168.10.0/24')).toBe(true)
    })

    it('should handle network address', () => {
      expect(calc.isInSubnet('192.168.10.0', '192.168.10.0/24')).toBe(true)
    })

    it('should handle broadcast address', () => {
      expect(calc.isInSubnet('192.168.10.255', '192.168.10.0/24')).toBe(true)
    })

    it('should handle /32 (host route)', () => {
      expect(calc.isInSubnet('10.0.0.1', '10.0.0.1/32')).toBe(true)
      expect(calc.isInSubnet('10.0.0.2', '10.0.0.1/32')).toBe(false)
    })
  })

  describe('sameSubnet', () => {
    it('should return true for two IPs in same subnet', () => {
      expect(calc.sameSubnet('192.168.10.1', '192.168.10.50', '192.168.10.0/24')).toBe(true)
    })

    it('should return false for IPs in different subnets', () => {
      expect(calc.sameSubnet('192.168.10.1', '192.168.11.1', '192.168.10.0/24')).toBe(false)
    })
  })

  describe('overlaps', () => {
    it('should detect overlapping subnets', () => {
      expect(calc.overlaps('192.168.10.0/24', '192.168.10.0/25')).toBe(true)
    })

    it('should return false for non-overlapping subnets', () => {
      expect(calc.overlaps('192.168.10.0/24', '192.168.11.0/24')).toBe(false)
    })

    it('should detect overlap when one contains the other', () => {
      expect(calc.overlaps('10.0.0.0/8', '10.10.0.0/16')).toBe(true)
    })

    it('should return false for adjacent subnets', () => {
      expect(calc.overlaps('192.168.10.0/25', '192.168.10.128/25')).toBe(false)
    })
  })

  describe('broadcastAddress', () => {
    it('should return correct broadcast for /24', () => {
      expect(calc.broadcastAddress('192.168.10.0/24')).toBe('192.168.10.255')
    })

    it('should return correct broadcast for /25', () => {
      expect(calc.broadcastAddress('192.168.10.0/25')).toBe('192.168.10.127')
    })

    it('should return correct broadcast for /16', () => {
      expect(calc.broadcastAddress('10.10.0.0/16')).toBe('10.10.255.255')
    })
  })

  describe('getNetworkCidr', () => {
    it('should normalize IP to network address', () => {
      expect(calc.getNetworkCidr('192.168.10.50/24')).toBe('192.168.10.0/24')
    })

    it('should handle host on /25 boundary', () => {
      expect(calc.getNetworkCidr('192.168.10.150/25')).toBe('192.168.10.128/25')
    })
  })

  describe('getHostCount', () => {
    it('should return 254 for /24', () => {
      expect(calc.getHostCount('192.168.10.0/24')).toBe(254)
    })

    it('should return 126 for /25', () => {
      expect(calc.getHostCount('192.168.10.0/25')).toBe(126)
    })
  })

  describe('isValidCidr', () => {
    it('should validate valid CIDR', () => {
      expect(calc.isValidCidr('192.168.10.0/24')).toBe(true)
    })

    it('should reject invalid CIDR', () => {
      expect(calc.isValidCidr('192.168.10.0')).toBe(false)
      expect(calc.isValidCidr('192.168.10.0/33')).toBe(false)
    })
  })
})
