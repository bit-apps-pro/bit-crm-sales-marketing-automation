import { type FormInstance } from 'antd'

export interface ShareWithContactProps {
  /** Portal capability key that controls whether sharing is allowed. */
  capability: 'calls' | 'meetings' | 'notes'
  entityId: number | string | undefined
  form: FormInstance
  /** Copy shown when the record is shared with the contact. */
  sharedText: string
  /** Copy shown when the record is private to the team. */
  unsharedText: string
}
