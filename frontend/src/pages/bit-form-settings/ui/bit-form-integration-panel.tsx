import { __ } from '@common/helpers/i18nWrap'
import { Button, Empty, Result, Skeleton, Typography } from 'antd'
import { useState } from 'react'
import { LuPlus } from 'react-icons/lu'

import useBitFormForms from '../data/use-bit-form-forms'
import BitFormFormsTable from './bit-form-forms-table'
import BitFormUpdateNotice from './bit-form-update-notice'
import CreateLeadFormModal from './create-lead-form-modal'

export default function BitFormIntegrationPanel() {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false)
  const { forms, formsError, isBitFormOutdated, isFormsLoading, refetchForms } = useBitFormForms()

  if (isFormsLoading) {
    return <Skeleton active paragraph={{ rows: 6 }} />
  }

  if (isBitFormOutdated) {
    return <BitFormUpdateNotice onRecheck={refetchForms} />
  }

  if (formsError) {
    return (
      <Result
        extra={
          <Button onClick={() => refetchForms()} type="primary">
            {__('Retry')}
          </Button>
        }
        status="error"
        subTitle={formsError.message || __('Failed to load forms from Bit Form.')}
        title={__('Something went wrong')}
      />
    )
  }

  const createButton = (
    <Button
      className="rounded-full"
      icon={<LuPlus />}
      onClick={() => setCreateModalOpen(true)}
      type="primary"
    >
      {__('Create form')}
    </Button>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Typography.Title className="mb-0" level={5}>
            {__('Lead Capture forms')}
          </Typography.Title>
          <Typography.Text type="secondary">{__('Bit Form connected to Bit CRM.')}</Typography.Text>
        </div>
        {forms.length > 0 && createButton}
      </div>

      {forms.length === 0 ? (
        <Empty description={__('No Bit Form forms are integrated with Bit CRM yet.')}>
          {createButton}
        </Empty>
      ) : (
        <BitFormFormsTable forms={forms} loading={isFormsLoading} />
      )}

      <CreateLeadFormModal onClose={() => setCreateModalOpen(false)} open={isCreateModalOpen} />
    </div>
  )
}
