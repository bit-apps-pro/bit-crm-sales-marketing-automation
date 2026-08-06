import { LoadingOutlined } from '@ant-design/icons'
import { MODULES } from '@common/constants/modules'
import { formatFieldsMap } from '@common/helpers/format-fields-map'
import generateEntityConversionFieldMappings from '@common/helpers/generateEntityConversionFieldMappings'
import { __ } from '@common/helpers/i18nWrap'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import If from '@utilities/If'
import { type FormInstance } from 'antd'
import { Button, Form, Select, Table, Typography } from 'antd'
import { useMemo } from 'react'

import useCompanyFields from './data/use-company-fields'
import useContactFields from './data/use-contact-fields'
import useConversionMapping from './data/use-conversion-mapping'
import useDealFields from './data/use-deal-fields'
import useLeadFields from './data/use-lead-fields'
import useSaveMapping from './data/use-save-mapping'
import { generateCompatibleFieldOptions } from './shared/helpers'
import { type DataSourceItem } from './shared/types'
import ConversionMappingSkeleton from './ui/ConversionMappingSkeleton'

export default function ConversionMapping() {
  const [form] = Form.useForm()
  const { isLeadFieldsFetching, isLeadFieldsLoading, leadFields } = useLeadFields()
  const {
    contactCustomFields,
    contactFields,
    contactSystemDefinedFields,
    isContactFieldsFetching,
    isContactFieldsLoading
  } = useContactFields()
  const {
    companyCustomFields,
    companyFields,
    companySystemDefinedFields,
    isCompanyFieldsFetching,
    isCompanyFieldsLoading
  } = useCompanyFields()
  const {
    dealCustomFields,
    dealFields,
    dealSystemDefinedFields,
    isDealFieldsFetching,
    isDealFieldsLoading
  } = useDealFields()
  const { conversionMapping, isConversionMappingFetching, isConversionMappingLoading } =
    useConversionMapping()
  const { isSavingMapping, saveMapping } = useSaveMapping()

  const dataSource: DataSourceItem[] = leadFields.map(field => ({
    companyField: companyFields.find(companyField => companyField.field_key === field.field_key),
    contactField: contactFields.find(contactField => contactField.field_key === field.field_key),
    dealField: dealFields.find(dealField => dealField.field_key === field.field_key),
    key: field.field_key,
    leadField: field,
    leadFieldKey: field.field_key,
    leadLabel: field.label
  }))

  const columns = [
    {
      dataIndex: 'leadLabel',
      key: 'lead',
      render: (text: string) => <Typography.Text>{text}</Typography.Text>,
      title: __('Lead')
    },
    {
      dataIndex: 'contactField',
      key: 'contact',
      render: (_field: FieldItem, record: DataSourceItem) => {
        const compatibleOptions = generateCompatibleFieldOptions(
          record.leadField.type,
          contactSystemDefinedFields,
          contactCustomFields
        )

        return (
          <Form.Item className="mb-0" name={['mappings', MODULES.CONTACT, record.leadFieldKey]}>
            <Select
              allowClear
              options={compatibleOptions}
              placeholder={__('Select a field')}
              showSearch
              style={{ width: '100%' }}
            />
          </Form.Item>
        )
      },
      title: __('Contact')
    },
    {
      dataIndex: 'companyField',
      key: 'company',
      render: (_field: FieldItem, record: DataSourceItem) => {
        const compatibleOptions = generateCompatibleFieldOptions(
          record.leadField.type,
          companySystemDefinedFields,
          companyCustomFields
        )

        return (
          <Form.Item className="mb-0" name={['mappings', MODULES.COMPANY, record.leadFieldKey]}>
            <Select
              allowClear
              options={compatibleOptions}
              placeholder={__('Select a field')}
              showSearch
              style={{ width: '100%' }}
            />
          </Form.Item>
        )
      },
      title: __('Company')
    },
    {
      dataIndex: 'dealField',
      key: 'deal',
      render: (_field: FieldItem, record: DataSourceItem) => {
        const compatibleOptions = generateCompatibleFieldOptions(
          record.leadField.type,
          dealSystemDefinedFields,
          dealCustomFields
        )

        return (
          <Form.Item className="mb-0" name={['mappings', MODULES.DEAL, record.leadFieldKey]}>
            <Select
              allowClear
              options={compatibleOptions}
              placeholder={__('Select a field')}
              showSearch
              style={{ width: '100%' }}
            />
          </Form.Item>
        )
      },
      title: __('Deal')
    }
  ]

  const handleSave = async (form: FormInstance) => {
    const values = await form.validateFields()
    const contactMappings = values?.mappings?.[MODULES.CONTACT] || {}
    const companyMappings = values?.mappings?.[MODULES.COMPANY] || {}
    const dealMappings = values?.mappings?.[MODULES.DEAL] || {}

    const formattedContactFields = formatFieldsMap(contactFields, contactMappings)
    const formattedCompanyFields = formatFieldsMap(companyFields, companyMappings)
    const formattedDealFields = formatFieldsMap(dealFields, dealMappings)

    const conversionMapping = {
      setting_key: 'lead_conversion_mapping',
      setting_value: {
        mappings: {
          company: {
            customFields: formattedCompanyFields.customFieldsValues,
            systemDefinedFields: {
              ...formattedCompanyFields.systemDefinedFieldsValues,
              company_name: 'name',
              owner_id: 'owner_id'
            }
          },
          contact: {
            customFields: formattedContactFields.customFieldsValues,
            systemDefinedFields: {
              ...formattedContactFields.systemDefinedFieldsValues,
              company_name: 'company_name',
              last_name: 'last_name',
              owner_id: 'owner_id'
            }
          },
          deal: {
            customFields: formattedDealFields.customFieldsValues,
            systemDefinedFields: {
              ...formattedDealFields.systemDefinedFieldsValues,
              company_name: 'company_name',
              last_name: 'name',
              owner_id: 'owner_id'
            }
          }
        }
      }
    }

    await saveMapping(conversionMapping)
  }

  const initialValues = useMemo(
    () => ({
      company: dataSource.reduce<Record<string, string>>(
        (accumulator, { companyField, leadFieldKey }) => {
          if (companyField) {
            accumulator[leadFieldKey] = companyField.field_key
          }
          return accumulator
        },
        {}
      ),
      contact: dataSource.reduce<Record<string, string>>(
        (accumulator, { contactField, leadFieldKey }) => {
          if (contactField) {
            accumulator[leadFieldKey] = contactField.field_key
          }
          return accumulator
        },
        {}
      ),
      deal: dataSource.reduce<Record<string, string>>((accumulator, { dealField, leadFieldKey }) => {
        if (dealField) {
          accumulator[leadFieldKey] = dealField.field_key
        }
        return accumulator
      }, {})
    }),
    [dataSource]
  )

  const formInitialValues = useMemo(() => {
    return generateEntityConversionFieldMappings(conversionMapping) || initialValues
  }, [conversionMapping, initialValues])

  const isLoading =
    isLeadFieldsLoading ||
    isContactFieldsLoading ||
    isCompanyFieldsLoading ||
    isDealFieldsLoading ||
    isConversionMappingLoading

  const isFetching =
    isLeadFieldsFetching ||
    isContactFieldsFetching ||
    isConversionMappingFetching ||
    isCompanyFieldsFetching ||
    isDealFieldsFetching

  if (isLoading) {
    return <ConversionMappingSkeleton />
  }

  return (
    <div className="light:bg-slate-100 space-y-2 rounded-lg">
      <div className="flex items-center gap-5">
        <Typography.Title className="mb-0" level={4}>
          {__('Field mapping')}
        </Typography.Title>
        <If conditions={isFetching}>
          <LoadingOutlined />
        </If>
      </div>
      <Form
        form={form}
        initialValues={{
          mappings: formInitialValues
        }}
        key={JSON.stringify(formInitialValues)}
        layout="vertical"
        onFinish={() => handleSave(form)}
      >
        <Table
          bordered
          className="mt-4"
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          size="small"
          tableLayout="fixed"
        />
        <Button
          className="mt-2"
          disabled={isSavingMapping}
          htmlType="submit"
          loading={isSavingMapping}
          type="primary"
        >
          {__('Save')}
        </Button>
      </Form>
    </div>
  )
}
