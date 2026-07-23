import { type FC } from 'react'

import { type ShareWithContactProps } from './types'

/**
 * Sharing records with a contact requires the Client Portal, which is pro-only,
 * so the free build renders nothing here.
 */
const ShareWithContact: FC<ShareWithContactProps> = () => {
  // eslint-disable-next-line unicorn/no-null
  return null
}

export default ShareWithContact
