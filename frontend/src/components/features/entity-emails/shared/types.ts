import { type MODULES } from '@common/constants/modules'

export interface FormattedEmailData {
  emailDate: string
  emailDirection: string
  entityEmail: string
  entityName: string
  id: number
  imapUsername: string
  key: number
  receivedBy: string
  sentBy: string
  status: string
  subject: string
}

export type EntityModule = (typeof MODULES)[keyof typeof MODULES]
