import { CaretRightOutlined } from '@ant-design/icons'
import CAPABILITIES from '@common/constants/capabilities'
import { MODULES } from '@common/constants/modules'
import NotifyContext from '@common/context/NotifyContext'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { formatModuleFieldsValues } from '@common/helpers/format-module-fields-values'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import EntityForm from '@features/entity-form/ui/entity-form'
import EntityTags from '@features/entity-overview/ui/entity-tags'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import Timeline from '@features/timeline'
import useDeleteTagEntity from '@pages/contact/internal/contact-overview/data/use-delete-tag-entity'
import useStoreTagEntity from '@pages/contact/internal/contact-overview/data/use-store-tag-entity'
import useUpdateContact from '@pages/contact/internal/contact-overview/data/use-update-contact'
import { type ContactOverviewPropsType, type ContactType } from '@pages/contact/shared/contact-types'
import { type FormInstance } from 'antd'
import { Button, Collapse, Form } from 'antd'
import { useContext } from 'react'
import { useParams } from 'react-router'

export default function ContactOverView({
  columnSettings,
  contact,
  fields,
  refetchContact,
  refetchTags,
  tags
}: ContactOverviewPropsType) {
  const { id: contactId } = useParams()
  const [form] = Form.useForm()
  const { isUpdatePending, updateContact } = useUpdateContact(form)
  const { isTagEntityStoring, storeTagEntity } = useStoreTagEntity(contactId)
  const { deleteTagEntity, isTagEntityDeleting } = useDeleteTagEntity()
  const { messageApi } = useContext(NotifyContext)

  const handleContactUpdate = async (form: FormInstance) => {
    const values = await form.validateFields()
    const formattedData = formatModuleFieldsValues(fields, values)
    formattedData.id = contactId

    await updateContact(formattedData)
    refetchContact()
  }

  const handleAddTag = async (tag: string) => {
    const tagEntityData = {
      contact_id: contactId,
      title: tag
    }
    await storeTagEntity(tagEntityData)

    refetchContact()
    refetchTags()
  }

  const handleRemoveTag = async (tag: string) => {
    const tagToDelete = tags.find(item => item.slug === tag)

    if (!tagToDelete) return messageApi?.error('Tag not found.')

    const deleteData = {
      contact_id: contactId,
      tag_id: tagToDelete?.id
    }

    const { data, status } = await deleteTagEntity(deleteData).catch(
      error => error as Response<ValidationType<unknown>>
    )

    if (status === 'error') {
      return messageApi?.error((data as string) || 'Could not remove tag.')
    }

    refetchContact()
    refetchTags()
    return messageApi?.success((data as string) || 'Tag removed successfully.')
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
      <div className="col-span-2 rounded-md border border-solid border-[#E5E3FE] bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <div className="sticky top-0 z-10 flex items-center justify-end rounded-t-md border-0 border-b border-solid border-[#E5E3FE] bg-white px-4 py-2 dark:bg-neutral-900">
          <Button
            className="rounded-full"
            loading={isUpdatePending}
            onClick={() => handleContactUpdate(form)}
            size="large"
            type="primary"
          >
            {__('Update')}
          </Button>
        </div>
        <EntityForm<ContactType, FieldItem>
          className="p-4"
          columnSettings={columnSettings}
          entity={contact}
          fields={fields}
          form={form}
        />
      </div>
      <div className="rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <Collapse
          bordered={false}
          className="bg-white dark:bg-neutral-900"
          defaultActiveKey={['tags', 'timeline']}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          items={[
            {
              children: (
                <EntityTags
                  disabled={!checkCapability(CAPABILITIES.CONTACT.UPDATE)}
                  loading={isTagEntityDeleting || isTagEntityStoring}
                  onAddTag={handleAddTag}
                  onRemoveTag={handleRemoveTag}
                  options={tags?.map(tag => ({ label: tag.title, value: tag.slug }))}
                  value={contact?.tags?.map(option => option.slug)}
                />
              ),
              key: 'tags',
              label: <span className="text-slate-500">{__('Tags')}</span>
            },
            {
              children: <Timeline entityId={contact?.id} module={MODULES.CONTACT} />,
              key: 'timeline',
              label: <span className="text-slate-500">{__('Timeline')}</span>
            }
          ]}
        />
      </div>
    </div>
  )
}
