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
  // The mock behind the banner can be much taller than the viewport, so the banner is stuck
  // to the app scroller and sized to its visible area instead of being centred across the
  // whole mock. 129px = 32px admin bar + 4px layout margin/border + 64px header above the
  // scroller, 8px margin/border below it, and 17px settings padding/border above the overlay.
  // `max-h-full` keeps short overlays (e.g. invoice panels) centred exactly as before.
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
      <div className="absolute inset-0">
        <div className="sticky top-0 flex h-[calc(100vh-129px)] max-h-full items-center justify-center p-4">
          <ProBanner featureName={featureName} showIcon={showIcon} />
        </div>
      </div>
    </div>
  )
}
