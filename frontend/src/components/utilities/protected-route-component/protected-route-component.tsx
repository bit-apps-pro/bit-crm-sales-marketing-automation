import { checkCapability } from '@common/helpers/capabilityHelper'
import { lazy } from 'react'

const AccessDenied = lazy(() => import('@pages/access-denied'))

const ProtectedRouteComponent = ({
  capability,
  children
}: {
  capability: string
  children: JSX.Element
}) => {
  if (!checkCapability(capability)) return <AccessDenied />
  return children
}
export default ProtectedRouteComponent
