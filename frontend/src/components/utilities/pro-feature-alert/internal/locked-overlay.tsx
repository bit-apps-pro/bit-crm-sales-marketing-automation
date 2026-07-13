import { cn } from '@common/helpers/globalHelpers'
import { type ReactNode } from 'react'

import { type ProFeatureAlertProps } from '../shared/type'
import ProBanner from '../ui/pro-banner'

interface LockedOverlayProps extends ProFeatureAlertProps {
  /** The static, faded module layout shown behind the pro banner. */
  children: ReactNode
  className?: string
  showIcon?: boolean
}

export default function LockedOverlay({
  children,
  className = 'min-h-[70vh]',
  featureName,
  showIcon = true
}: LockedOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      <div
        className="opacity-50"
        {...{ inert: '' }}
        style={{
          filter: 'blur(2px)',
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 70%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 70%)'
        }}
      >
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <ProBanner featureName={featureName} showIcon={showIcon} />
      </div>
    </div>
  )
}
