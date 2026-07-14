import { formatModuleFieldsValues } from '@common/helpers/format-module-fields-values'
import { __, sprintf } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Form, Modal } from 'antd'
import { capitalize } from 'lodash'

import useRequiredModuleFields from './data/use-required-module-fields'
import useStoreEntity from './data/use-store-entity'
import { type EntityQuickCreateModalProps } from './shared/types'
import {
  useEntityQuickCreateActions,
  useEntityQuickCreateFieldKey,
  useEntityQuickCreateModule,
  useIsEntityQuickCreateOpen
} from './state/use-entity-quick-create-store'
import EntityQuickCreateForm from './ui/entity-quick-create-form'
import EntityQuickCreateSkeleton from './ui/entity-quick-create-skeleton'

export default function EntityQuickCreateModal({
  currencyData,
  form: entityForm
}: EntityQuickCreateModalProps) {
  const [form] = Form.useForm()
  const { handleClose: close } = useEntityQuickCreateActions()
  const fieldKey = useEntityQuickCreateFieldKey()
  const module = useEntityQuickCreateModule()
  const open = useIsEntityQuickCreateOpen()

  const { fields, isFieldsPending } = useRequiredModuleFields(module)
  const { isStoringPending, storeEntity } = useStoreEntity(form, module)

  const handleClose = () => {
    close()
    form.resetFields()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const { customFieldsValues, systemDefinedFieldsValues } = formatModuleFieldsValues(fields, values)

    const { data } = await storeEntity({
      customFieldsValues,
      systemDefinedFieldsValues
    })

    if (data?.id && entityForm) entityForm.setFieldValue(fieldKey, data.id)
    handleClose()
  }

  return (
    <Modal
      centered
      confirmLoading={isStoringPending}
      destroyOnHidden
      okButtonProps={{ disabled: isStoringPending || isFieldsPending }}
      okText={__('Create')}
      onCancel={handleClose}
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
      title={sprintf(
        /* translators: %s: Entity type being created. */
        __('Create %s'),
        capitalize(module)
      )}
    >
      <If conditions={isFieldsPending}>
        <EntityQuickCreateSkeleton />
      </If>
      <If conditions={!isFieldsPending && open}>
        <EntityQuickCreateForm currencyData={currencyData} fields={fields} form={form} />
      </If>
    </Modal>
  )
}
