import { __ } from '@common/helpers/i18nWrap'
import { type IconType } from 'react-icons'
import { LuMail, LuMessageCircle, LuMessageSquare, LuSend } from 'react-icons/lu'

export interface InvoiceShareTarget {
  color: string
  icon: IconType
  label: string
  url: string
}

export const buildInvoiceShareTargets = (shareUrl: string): InvoiceShareTarget[] => {
  const shareMessage = __('You can view and pay your invoice here:')
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedMessage = encodeURIComponent(`${shareMessage} ${shareUrl}`)
  const emailSubject = encodeURIComponent(__('Your invoice'))

  return [
    {
      color: '#25D366',
      icon: LuMessageCircle,
      label: __('WhatsApp'),
      url: `https://wa.me/?text=${encodedMessage}`
    },
    {
      color: '#229ED9',
      icon: LuSend,
      label: __('Telegram'),
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(shareMessage)}`
    },
    {
      color: '#0084FF',
      icon: LuMessageSquare,
      label: __('Messenger'),
      url: `https://www.facebook.com/dialog/send?link=${encodedUrl}&redirect_uri=${encodedUrl}`
    },
    {
      color: '#EA4335',
      icon: LuMail,
      label: __('Email'),
      url: `mailto:?subject=${emailSubject}&body=${encodedMessage}`
    }
  ]
}
