import { MODULES } from '@common/constants/modules'
import LookupFieldSelect from '@features/lookup-field-select'
import { type RelatedFieldOption } from '@features/lookup-field-select/data/use-lookup-select-options'
import { Form, type FormInstance } from 'antd'
import { useCallback } from 'react'

interface CompanySelectProps {
  form: FormInstance
}

export default function CompanySelect({ form }: CompanySelectProps) {
  const companyId = Form.useWatch('company_id', form)

  const handleCompanyChange = useCallback(
    (companyId: number | string, option?: RelatedFieldOption) => {
      form.setFieldValue('company_id', companyId)
      const currency = option?.data?.currency

      if (currency) {
        form.setFieldValue('currency', currency)
      }
    },
    [form]
  )

  return (
    <LookupFieldSelect
      columnSelect={['currency']}
      fieldKey="company_id"
      onChange={handleCompanyChange}
      relatedModule={MODULES.COMPANY}
      showAddNew
      value={companyId}
    />
  )
}
