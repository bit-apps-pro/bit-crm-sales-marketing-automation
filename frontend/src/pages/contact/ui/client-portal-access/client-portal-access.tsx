import { type FC } from 'react'

import { type ClientPortalAccessProps } from './types'

// Client Portal access is pro-only, so the free build renders nothing here.
const ClientPortalAccess: FC<ClientPortalAccessProps> = () => {
  return <></>
}

export default ClientPortalAccess
