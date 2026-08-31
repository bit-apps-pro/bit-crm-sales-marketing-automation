import { type MODULES } from '@common/constants/modules'

export interface FormattedEmailData {
  bcc: string[]
  cc: string[]
  emailDate: string
  emailDirection: string
  entityEmail: string
  entityName: string
  /** Real From header; empty for rows synced before it was stored. */
  fromEmail: string
  id: number
  imapUsername: string
  key: number
  receivedBy: string
  sentBy: string
  status: string
  subject: string
  /** Real To header; empty for rows synced before it was stored. */
  toEmails: string[]
}

export type EntityModule = (typeof MODULES)[keyof typeof MODULES]
