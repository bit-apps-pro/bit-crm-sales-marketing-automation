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

  const columns: TableColumnsType<T> = [
    {
      dataIndex: 'label',
      title: __('Label')
    },
    {
      align: 'center',
      render: ({ field_key: fieldKey, required }: T) => (
        <Switch
          defaultChecked={!!required}
          onChange={value =>
            onStateChange({
              [fieldKey]: { required: value }
            })
          }
          size="small"
        />
      ),
      title: __('Required')
    },
    {
      align: 'center',
      render: ({ field_key: fieldKey, status }: T) => (
        <Switch
          defaultChecked={status === undefined ? false : !status}
          onChange={value =>
            onStateChange({
              [fieldKey]: { status: !value }
            })
          }
          size="small"
        />
      ),
      title: __('Disabled')
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
