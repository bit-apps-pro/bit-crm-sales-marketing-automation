import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Button } from 'antd'
import { useState } from 'react'
import { LuTrash2 } from 'react-icons/lu'

import ClientPortalAccess from './client-portal-access'
import DeleteModal from './delete-modal'

export default function Actions({ id }: { id: number | string }) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <If conditions={checkCapability(CAPABILITIES.SETTING.PORTAL_SETTINGS)}>
          <ClientPortalAccess id={id} />
        </If>
        <Button
          className="rounded-full p-0"
          danger
          disabled={!checkCapability(CAPABILITIES.CONTACT.DELETE)}
          icon={<LuTrash2 size={14} />}
          onClick={() => setIsDeleteModalOpen(true)}
          type="link"
        >
          {__('Delete')}
        </Button>
      </div>

      <DeleteModal id={id} open={isDeleteModalOpen} setOpen={setIsDeleteModalOpen} />
    </>
  )
}
