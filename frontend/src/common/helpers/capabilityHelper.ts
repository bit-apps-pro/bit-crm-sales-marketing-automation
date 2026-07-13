import CAPABILITIES from '@common/constants/capabilities'
import config from '@config/config'

export const checkCapability = (capability: string) => {
  if (!capability || capability.trim() === '') {
    return false
  }

  const capabilities = Array.isArray(config.CAPABILITIES) ? config.CAPABILITIES : []

  if (capabilities.includes(CAPABILITIES.ADMINISTRATOR)) {
    return true
  }

  return capabilities.includes(capability)
}

export function getCapability(action: string, relatedEntity: string): string {
  const module = relatedEntity.toUpperCase() as keyof typeof CAPABILITIES

  if (!(module in CAPABILITIES)) {
    return ''
  }

  const capabilityValue = CAPABILITIES[module]
  return capabilityValue[action as keyof typeof capabilityValue]
}
