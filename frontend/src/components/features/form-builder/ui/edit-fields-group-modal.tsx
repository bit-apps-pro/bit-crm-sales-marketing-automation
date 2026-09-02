import { __ } from '@common/helpers/i18nWrap'
import { Button, Modal, Switch, Table, type TableColumnsType, Tooltip } from 'antd'
import { useState } from 'react'
import { LuPenLine } from 'react-icons/lu'

import { type BaseFieldType, type EditFieldsGroupModalPropsType } from '../shared/field-types'

export default function EditFieldsGroupModal<T extends BaseFieldType>({
  item,
  onStateChange
}: EditFieldsGroupModalPropsType<T>) {
  const { group_fields: fieldsGroup } = item

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleModal = (open: boolean) => () => {
    setIsModalOpen(open)
  }

  // Never lock both switches at once, or a field saved as disabled + required
  // could not be recovered from the UI.
  const lockRequired = ({ hidden, status }: T) => Boolean(hidden) || status === false
  const lockDisabled = ({ hidden, required, status }: T) =>
    Boolean(hidden) || (Boolean(required) && status !== false)

  const columns: TableColumnsType<T> = [
    {
      dataIndex: 'label',
      title: __('Label')
    },
    {
      align: 'center',
      render: (field: T) => (
        <Switch
          defaultChecked={!!field.required}
          disabled={lockRequired(field)}
          onChange={value =>
            onStateChange({
              [field.field_key]: { required: value }
            })
          }
          size="small"
        />
      ),
      title: __('Required')
    },
    {
      align: 'center',
      render: (field: T) => (
        <Switch
          defaultChecked={field.status === false}
          disabled={lockDisabled(field)}
          onChange={value =>
            onStateChange({
              [field.field_key]: { status: !value }
            })
          }
          size="small"
        />
      ),
      title: __('Disabled')
    },
    {
      align: 'center',
      render: ({ field_key: fieldKey, hidden }: T) => (
        <Switch
          defaultChecked={Boolean(hidden)}
          onChange={value =>
            onStateChange({
              [fieldKey]: { hidden: value }
            })
          }
          size="small"
        />
      ),
      title: __('Hide')
    }
  ]

  const dataSource: (T & { key: string })[] = Object.values(fieldsGroup ?? {}).map(field => ({
    ...(field as T),
    key: field.field_key
  }))

  return (
    <>
      <Tooltip destroyOnHidden mouseEnterDelay={0.5} placement="bottom" title={__('Edit')}>
        <Button
          aria-label={__('Edit field')}
          icon={<LuPenLine size={14} strokeWidth={2} />}
          onClick={handleModal(true)}
          shape="circle"
          size="middle"
          type="link"
        />
      </Tooltip>

      <Modal
        footer={false}
        onCancel={handleModal(false)}
        open={isModalOpen}
        title={__('Edit Fields Group')}
      >
        <div className="mt-4">
          <Table columns={columns} dataSource={dataSource} pagination={false} size="small" />
        </div>
      </Modal>
    </>
  )
}
