/* eslint-disable camelcase */
import { InboxOutlined } from '@ant-design/icons'
import NotifyContext from '@common/context/NotifyContext'
import { findMatchedFieldKey } from '@common/helpers/entity-helpers'
import { formatFieldsMap } from '@common/helpers/format-fields-map'
import { generateLookupFieldsOptions } from '@common/helpers/generate-lookup-fields-options'
import { __ } from '@common/helpers/i18nWrap'
import DownloadSample from '@features/download-sample'
import { SAMPLE_FILE_NAMES } from '@features/download-sample/shared/constants'
import { type Deal } from '@pages/deal/shared/deal-types'
import { DUPLICATE_HANDLING_OPTIONS, LOOKUP_FIELDS_CONFIG } from '@pages/deals/shared/constants'
import { validateFields } from '@pages/deals/shared/helpers'
import { type ImportDealsProps } from '@pages/deals/shared/types'
import If from '@utilities/If'
import {
  Button,
  Form,
  Modal,
  Select,
  Table,
  TreeSelect,
  Typography,
  Upload,
  type UploadProps
} from 'antd'
import Papa from 'papaparse'
import { useContext, useMemo, useState } from 'react'
import { LuDownload, LuInfo } from 'react-icons/lu'

import useImportDeals from '../data/use-import-deals'

export default function ImportDeals({ customFields, systemDefinedFields }: ImportDealsProps) {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const [file, setFile] = useState<File>()
  const [headers, setHeaders] = useState<string[]>([])
  const [data, setData] = useState<Partial<Deal>[]>([])
  const { messageApi } = useContext(NotifyContext)

  const handleModal = (open: boolean) => {
    if (!open) {
      setFile(undefined)
      setHeaders([])
    }
    setOpen(open)
  }
  const { importDeals, isImportingDeals } = useImportDeals(form, handleModal)

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      complete: function (results) {
        setHeaders(results.meta.fields || [])
        setData(results.data as Partial<Deal>[])
      },
      error: function (err) {
        console.error('Parse error:', err)
      },
      header: true,
      skipEmptyLines: true
    })
  }

  const props: UploadProps = {
    beforeUpload(file) {
      setFile(file)
      parseCSV(file)
      return false
    },
    name: 'file'
  }

  const allFields = useMemo(() => {
    const extendedSystemFields = systemDefinedFields.flatMap(field => {
      const lookupFieldConfig =
        LOOKUP_FIELDS_CONFIG[field.field_key as keyof typeof LOOKUP_FIELDS_CONFIG]

      if (lookupFieldConfig) {
        return [
          field,
          {
            ...field,
            field_key: lookupFieldConfig.targetNameValue,
            label: lookupFieldConfig.targetNameLabel
          }
        ]
      }
      return field
    })

    return [...extendedSystemFields, ...customFields]
  }, [systemDefinedFields, customFields])

  const fieldOptions = useMemo(
    () => generateLookupFieldsOptions(systemDefinedFields, customFields, LOOKUP_FIELDS_CONFIG),
    [systemDefinedFields, customFields]
  )

  const columns = [
    {
      dataIndex: 'header',
      key: 'header',
      render: (text: string) => <Typography.Text>{text}</Typography.Text>,
      title: __('CSV Header')
    },
    {
      dataIndex: 'field',
      key: 'field',
      render: (header: string) => (
        <Form.Item className="mb-0" initialValue={findMatchedFieldKey(header, allFields)} name={header}>
          <TreeSelect
            allowClear
            placeholder={__('Select a field')}
            popupMatchSelectWidth={false}
            showSearch
            style={{ width: '100%' }}
            treeData={fieldOptions}
            treeDefaultExpandAll
          />
        </Form.Item>
      ),
      title: __('Map to Field')
    }
  ]

  const dataSource = headers.map(header => ({
    field: header,
    header,
    key: header
  }))

  const handleSubmit = async () => {
    if (data.length === 0) return messageApi?.error(__('Chosen file is empty!'))

    const { duplicate_handling, ...values } = await form.validateFields()

    const validationError = validateFields(Object.values(values))
    if (validationError) {
      return messageApi?.error(validationError)
    }

    const formattedFields = formatFieldsMap(allFields, values)

    const formData = new FormData()
    if (file) {
      formData.append('file', file)
    }
    formData.append('fields', JSON.stringify(formattedFields))
    formData.append('options', JSON.stringify({ duplicate_handling }))

    await importDeals(formData)
    form.resetFields()
  }

  return (
    <>
      <Button
        aria-label={__('Import Deals')}
        className="rounded-l-full text-sm text-gray-500 dark:text-gray-400"
        icon={<LuDownload />}
        onClick={() => handleModal(true)}
      >
        {__('Import')}
      </Button>
      <Modal
        centered
        confirmLoading={isImportingDeals}
        destroyOnHidden
        footer={(_, { CancelBtn, OkBtn }) => (
          <div className="flex items-center justify-between">
            <div>
              <If conditions={!file && open}>
                <DownloadSample fileName={SAMPLE_FILE_NAMES.SAMPLE_ENTITIES} />
              </If>
            </div>
            <div className="flex gap-2">
              <CancelBtn />
              <OkBtn />
            </div>
          </div>
        )}
        okButtonProps={{ disabled: !file }}
        okText={__('Import')}
        onCancel={() => handleModal(false)}
        onOk={handleSubmit}
        open={open}
        styles={{
          body: {
            marginInline: '-22px',
            maxHeight: '70vh',
            overflowY: 'auto',
            paddingInline: '22px'
          }
        }}
        title={__('Import Deals')}
      >
        <If conditions={open}>
          {file ? (
            <Form className="space-y-3" form={form} layout="vertical">
              <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 dark:bg-blue-950/30">
                <LuInfo className="mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" size={18} />
                <Typography.Text className="text-xs text-blue-700 dark:text-blue-300">
                  {__(
                    'Note: Deals with invalid or missing stages in your CRM will be skipped during import.'
                  )}
                </Typography.Text>
              </div>
              <Table
                bordered
                className="mt-4"
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                tableLayout="fixed"
              />
              <Form.Item
                initialValue="skip"
                label={__('If a deal with the same name already exists')}
                name="duplicate_handling"
                rules={[{ message: __('Please select how to handle duplicate deals'), required: true }]}
              >
                <Select options={DUPLICATE_HANDLING_OPTIONS} placeholder={__('Select an option')} />
              </Form.Item>
            </Form>
          ) : (
            <Upload.Dragger accept=".csv" maxCount={1} {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">{__('Click or drag csv file to this area to upload')}</p>
              <p className="ant-upload-hint">{__('Support for a single upload.')}</p>
            </Upload.Dragger>
          )}
        </If>
      </Modal>
    </>
  )
}
