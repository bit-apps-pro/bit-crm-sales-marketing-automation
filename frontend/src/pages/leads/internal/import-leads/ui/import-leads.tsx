import { InboxOutlined } from '@ant-design/icons'
import NotifyContext from '@common/context/NotifyContext'
import { findMatchedFieldKey } from '@common/helpers/entity-helpers'
import { formatFieldsMap } from '@common/helpers/format-fields-map'
import { __ } from '@common/helpers/i18nWrap'
import DownloadSample from '@features/download-sample'
import { SAMPLE_FILE_NAMES } from '@features/download-sample/shared/constants'
import { type LeadType } from '@pages/lead/shared/lead-types'
import { type ImportLeadsPropsType } from '@pages/leads/shared/leads-types'
import If from '@utilities/If'
import { Button, Form, Modal, Select, Table, Typography, Upload, type UploadProps } from 'antd'
import Papa from 'papaparse'
import { useContext, useMemo, useState } from 'react'
import { LuFileDown } from 'react-icons/lu'

import useImportLeads from '../data/use-import-leads'

const DUPLICATE_HANDLING_OPTIONS = [
  {
    label: __('Skip existing leads'),
    value: 'skip'
  },
  {
    label: __('Update existing leads'),
    value: 'update'
  },
  {
    label: __('Create new even if email exists'),
    value: 'create'
  }
]

export default function ImportLeads({ customFields, systemDefinedFields }: ImportLeadsPropsType) {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const [file, setFile] = useState<File>()
  const [headers, setHeaders] = useState<string[]>([])
  const [data, setData] = useState<Partial<LeadType>[]>([])
  const { messageApi } = useContext(NotifyContext)
  const { importLeads, isImportingPending } = useImportLeads(form)

  const handleModal = (open: boolean) => {
    if (!open) {
      setFile(undefined)
      setHeaders([])
    }
    setOpen(open)
  }

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      complete: function (results) {
        setHeaders(results.meta.fields || [])
        setData(results.data as Partial<LeadType>[])
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

  const fieldOptions = useMemo(() => {
    const result = []

    const systemOptions = systemDefinedFields?.map(field => ({
      label: field?.label,
      value: field?.field_key
    }))

    if (systemOptions.length > 0) {
      result.push({
        label: __('System Defined Fields'),
        options: systemOptions
      })
    }

    const customOptions = customFields?.map(field => ({
      label: field?.label,
      value: field?.field_key
    }))

    if (customOptions.length > 0) {
      result.push({
        label: __('Custom Fields'),
        options: customOptions
      })
    }

    return result
  }, [systemDefinedFields, customFields])

  const allFields = useMemo(
    () => [...systemDefinedFields, ...customFields],
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
          <Select
            allowClear
            options={fieldOptions}
            placeholder={__('Select a field')}
            showSearch
            style={{ width: '100%' }}
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

    const { duplicate_handling: duplicateHandling, ...values } = await form.validateFields()

    if (!Object.values(values).includes('last_name'))
      return messageApi?.error(__('The Last Name field must be mapped!'))

    const formattedFields = formatFieldsMap(allFields, values)

    const formData = new FormData()
    if (file) {
      formData.append('file', file)
    }
    formData.append('fields', JSON.stringify(formattedFields))
    formData.append('options', JSON.stringify({ duplicate_handling: duplicateHandling }))

    await importLeads(formData)

    handleModal(false)
  }

  return (
    <>
      <Button
        aria-label={__('Import Leads')}
        className="rounded-l-full text-sm text-gray-500 dark:text-gray-400"
        icon={<LuFileDown size={14} />}
        onClick={() => handleModal(true)}
      >
        {__('Import')}
      </Button>
      <Modal
        centered
        confirmLoading={isImportingPending}
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
        title={__('Import Leads')}
      >
        <If conditions={open}>
          {file ? (
            <Form className="space-y-3" form={form} layout="vertical" onFinish={handleSubmit}>
              <Table
                bordered
                className="mt-4"
                columns={columns}
                dataSource={dataSource}
                pagination={false}
              />
              <Form.Item
                initialValue="skip"
                label={__('If a lead with the same email already exists')}
                name="duplicate_handling"
                rules={[{ message: __('Please select how to handle duplicate leads'), required: true }]}
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
