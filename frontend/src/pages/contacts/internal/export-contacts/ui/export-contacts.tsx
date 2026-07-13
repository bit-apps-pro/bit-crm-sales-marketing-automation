import { __ } from '@common/helpers/i18nWrap'
import { type ExportContactsPropsType } from '@pages/contacts/shared/types'
import { ProBanner } from '@utilities/pro-feature-alert'
import { Button, Modal } from 'antd'
import { type FC, useState } from 'react'
import { LuFileUp } from 'react-icons/lu'

const ExportContacts: FC<ExportContactsPropsType> = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        aria-label={__('Export Contacts')}
        className="rounded-r-full text-sm text-gray-500 dark:text-gray-400"
        icon={<LuFileUp size={14} />}
        onClick={() => setOpen(true)}
      >
        {__('Export')}
      </Button>
      <Modal
        centered
        footer={false}
        onCancel={() => setOpen(false)}
        open={open}
        title={__('Export Contacts')}
      >
        <ProBanner featureName={__('Export Contacts')} />
      </Modal>
    </>
  )
}

export default ExportContacts
