import { InboxOutlined } from '@ant-design/icons'
import NotifyContext from '@common/context/NotifyContext'
import { findMatchedFieldKey } from '@common/helpers/entity-helpers'
import { formatFieldsMap } from '@common/helpers/format-fields-map'
import { generateLookupFieldsOptions } from '@common/helpers/generate-lookup-fields-options'
import { __ } from '@common/helpers/i18nWrap'
import DownloadSample from '@features/download-sample'
import { SAMPLE_FILE_NAMES } from '@features/download-sample/shared/constants'
import { type ContactType } from '@pages/contact/shared/contact-types'
import { DUPLICATE_HANDLING_OPTIONS, LOOKUP_FIELDS_CONFIG } from '@pages/contacts/shared/constants'
import { validateFields } from '@pages/contacts/shared/helpers'
import { type ImportContactsPropsType } from '@pages/contacts/shared/types'
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
import { LuFileDown } from 'react-icons/lu'

import useImportContacts from '../data/use-import-contacts'

export default function ImportContacts({ customFields, systemDefinedFields }: ImportContactsPropsType) {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const [file, setFile] = useState<File>()
  const [headers, setHeaders] = useState<string[]>([])
  const [data, setData] = useState<Partial<ContactType>[]>([])
  const { messageApi } = useContext(NotifyContext)
  const { importContacts, isImportingPending } = useImportContacts(form)

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
        setData(results.data as Partial<ContactType>[])
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

    const { duplicateHandling, ...values } = await form.validateFields()

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
    formData.append('options', JSON.stringify({ duplicate_handling: duplicateHandling }))

    await importContacts(formData)

    handleModal(false)
  }

  return (
    <>
      <Button
        aria-label={__('Import Contacts')}
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
        title={__('Import Contacts')}
      >
        <If conditions={open}>
          {file ? (
            <Form className="space-y-3" form={form} layout="vertical" onFinish={handleModal}>
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
                label={__('If a contact with the same email already exists')}
                name="duplicateHandling"
                rules={[
                  { message: __('Please select how to handle duplicate contacts'), required: true }
                ]}
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
