import CAPABILITIES from '@common/constants/capabilities'
import { MODULES } from '@common/constants/modules'

import { type EntityModule } from './types'

export const getEmailCapability = (moduleName: EntityModule) => {
  switch (moduleName) {
    case MODULES.CONTACT: {
      return CAPABILITIES.CONTACT.VIEW
    }
    case MODULES.DEAL: {
      return CAPABILITIES.DEAL.VIEW
    }
    case MODULES.LEAD: {
      return CAPABILITIES.LEAD.VIEW
    }
    default: {
      return 'unknown'
    }
  }
}
