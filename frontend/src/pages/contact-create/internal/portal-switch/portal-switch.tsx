import { type FC } from 'react'

interface PortalSwitchProps {
  clientPortalAccessEnabled: boolean
  setClientPortalAccessEnabled: (value: boolean) => void
}

// Client Portal access is pro-only, so the free build renders nothing here.
const PortalSwitch: FC<PortalSwitchProps> = () => {
  return <></>
}

export default PortalSwitch
