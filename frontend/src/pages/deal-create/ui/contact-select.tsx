import { MODULES } from '@common/constants/modules'
import LookupFieldSelect from '@features/lookup-field-select'
import { type RelatedFieldOption } from '@features/lookup-field-select/data/use-lookup-select-options'
import { Form, type FormInstance } from 'antd'
import { useCallback } from 'react'

interface ContactSelectProps {
  form: FormInstance
}

export default function ContactSelect({ form }: ContactSelectProps) {
  const contactId = Form.useWatch('contact_id', form)

  const handleChange = useCallback(
    (contactId: number | string, option?: RelatedFieldOption) => {
      form.setFieldValue('contact_id', contactId)

      const currency = option?.data?.currency
      const companyId = option?.data?.company_id
      const email = option?.data?.email
      const existingCompanyId = form.getFieldValue('company_id')
      form.setFieldValue('email', email ?? undefined)

      if (Number(companyId)) {
        form.setFieldValue('company_id', companyId)
      }

      if (currency && !existingCompanyId) {
        form.setFieldValue('currency', currency)
      }
    },
    [form]
  )

  return (
    <LookupFieldSelect
      columnSelect={['currency', 'company_id', 'email']}
      fieldKey="contact_id"
      onChange={handleChange}
      relatedModule={MODULES.CONTACT}
      showAddNew
      value={contactId}
    />
  )
}
