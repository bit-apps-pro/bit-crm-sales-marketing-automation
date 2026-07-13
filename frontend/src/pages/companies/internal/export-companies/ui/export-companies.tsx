import { __ } from '@common/helpers/i18nWrap'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import { ProBanner } from '@utilities/pro-feature-alert'
import { Button, Modal } from 'antd'
import { type FC, useState } from 'react'
import { LuUpload } from 'react-icons/lu'

interface ExportCompaniesProps {
  customFields: FieldItem[]
  systemDefinedFields: FieldItem[]
  totalCompanies: number
}

const ExportCompanies: FC<ExportCompaniesProps> = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        aria-label={__('Export Companies')}
        className="rounded-r-full text-sm text-gray-500 dark:text-gray-400"
        icon={<LuUpload />}
        onClick={() => setOpen(true)}
      >
        {__('Export')}
      </Button>
      <Modal
        centered
        footer={false}
        onCancel={() => setOpen(false)}
        open={open}
        title={__('Export Companies')}
      >
        <ProBanner featureName={__('Export Companies')} />
      </Modal>
    </>
  )
}

export default ExportCompanies
