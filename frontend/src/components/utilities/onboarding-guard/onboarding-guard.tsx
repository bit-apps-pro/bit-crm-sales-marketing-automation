import { $appConfig } from '@common/globalStates'
import { useAtomValue } from 'jotai'
import { Navigate } from 'react-router'

interface OnboardingGuardProps {
  children: React.ReactNode
}

const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
  const { onboardingCompleted } = useAtomValue($appConfig)

  if (!onboardingCompleted) return <Navigate replace to="/onboarding" />
  return <>{children}</>
}

export default OnboardingGuard
