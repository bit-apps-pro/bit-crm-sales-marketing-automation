/* eslint-disable unicorn/no-typeof-undefined */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line no-restricted-imports
import { __ as i18n_, sprintf as i18nsprintf } from '@wordpress/i18n'

declare let wp: any

const __ = (text: string, domain = 'bit-crm-sales-marketing-automation') => {
  if (SERVER_VARIABLES?.translations?.[text]) {
    return SERVER_VARIABLES.translations[text]
  }

  if (typeof wp !== 'undefined' && !wp?.i18n) {
    return text
  }

  return i18n_(text, domain)
}

const sprintf = (text: string, ...vars: any) => {
  if (typeof wp === 'undefined' || !wp?.i18n) {
    const matches: any = text.match(/%[ E-GXb-gosux]/g)
    let str = text
    vars.map((val: any, idx: number) => {
      str = str.replace(matches[idx], val)
    })
    return str
  }
  return i18nsprintf(text, vars)
}

export { __, sprintf }
