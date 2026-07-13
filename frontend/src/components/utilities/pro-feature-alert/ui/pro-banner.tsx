import { cn } from '@common/helpers/globalHelpers'
import { __, sprintf } from '@common/helpers/i18nWrap'
import lockIcon from '@resource/img/lock.svg'
import If from '@utilities/If'
import { Button, theme } from 'antd'
import { LuCrown } from 'react-icons/lu'

import { type ProFeatureAlertProps } from '../shared/type'

interface ProBannerProps extends ProFeatureAlertProps {
  className?: string
  showIcon?: boolean
}

export default function ProBanner({ className = '', featureName, showIcon = true }: ProBannerProps) {
  const { token } = theme.useToken()
  const primary = token.colorPrimary

  const subTitle = featureName
    ? sprintf(__('Upgrade to Bit CRM Pro to unlock %s.'), featureName)
    : __('Upgrade to Bit CRM Pro to unlock this feature.')

  return (
    <div
      className={cn(
        'mx-auto flex max-w-sm flex-col items-center gap-4 px-8 py-7 text-center',
        className
      )}
    >
      <If conditions={showIcon}>
        <div className="flex items-center justify-center rounded-lg bg-white p-1 shadow-lg dark:bg-neutral-800">
          <img alt={__('Pro Feature')} className="size-16 -rotate-12" src={lockIcon} />
        </div>
      </If>
      <div>
        <h2 className="m-0 mb-1 text-3xl font-semibold" style={{ color: primary }}>
          {__('Pro Feature')}
        </h2>
        <p className="m-0 text-sm text-gray-500 dark:text-gray-400">{subTitle}</p>
      </div>
      <Button
        href="https://bitapps.pro/"
        icon={<LuCrown size={16} />}
        rel="noopener noreferrer"
        size="large"
        style={{
          background: 'linear-gradient(212.29deg, #D875FF -6.01%, #754FF1 56.19%, #B657FF 118.4%)',
          border: 'none',
          borderRadius: 9999
        }}
        target="_blank"
        type="primary"
      >
        {__('Unlock with Pro')}
      </Button>
    </div>
  )
}
