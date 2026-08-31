import { __ } from '@common/helpers/i18nWrap'

export const IMAP_DOC_URL =
  'https://bit-crm.com/docs/settings-admin/how-to-configure-imap-settings-in-bit-crm/'

/** Where each provider lets the user generate the app password this form asks for. */
export const APP_PASSWORD_GUIDES: Record<string, { href: string; label: string }> = {
  gmail: {
    href: 'https://myaccount.google.com/apppasswords',
    label: __('Generate a Google app password')
  },
  zoho: {
    href: 'https://accounts.zoho.com/home#security/app_password',
    label: __('Generate a Zoho app password')
  }
}
