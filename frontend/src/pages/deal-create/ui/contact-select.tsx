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
      const companyCurrency = option?.data?.company_currency
      const companyId = option?.data?.company_id
      const email = option?.data?.email
      const existingCompanyId = form.getFieldValue('company_id')
      form.setFieldValue('email', email ?? undefined)

      const hasLinkedCompany = Boolean(Number(companyId))

      if (hasLinkedCompany) {
        form.setFieldValue('company_id', companyId)
      }

      // A company's currency always wins, whether the company came from this contact or was
      // already on the form. The contact's own currency is the fallback when no company is
      // involved, or when the linked company has no currency of its own. A company already on
      // the form keeps its currency: selecting a contact must not downgrade it.
      if (companyCurrency) {
        form.setFieldValue('currency', companyCurrency)
      } else if (currency && (hasLinkedCompany || !existingCompanyId)) {
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
