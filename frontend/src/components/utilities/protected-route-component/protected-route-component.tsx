import { checkCapability } from '@common/helpers/capabilityHelper'
import { lazy } from 'react'

const AccessDenied = lazy(() => import('@pages/access-denied'))

const ProtectedRouteComponent = ({
  capability,
  children
}: {
  /** One capability, or a list where any one grants access. */
  capability: string | string[]
  children: JSX.Element
}) => {
  if (![capability].flat().some(checkCapability)) return <AccessDenied />
  return children
}
export default ProtectedRouteComponent
