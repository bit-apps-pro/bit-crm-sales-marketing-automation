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
import { type CompanyOverviewPropsType, type CompanyType } from '@pages/company/shared/company-types'
import { Button, Collapse, Form } from 'antd'
import { useContext } from 'react'
import { useParams } from 'react-router'

import useDeleteTagEntity from './data/use-delete-tag-entity'
import useStoreTagEntity from './data/use-store-tag-entity'
import useUpdateCompany from './data/use-update-company'

export default function CompanyOverview({
  columnSettings,
  company,
  fields,
  refetchCompany,
  refetchTags,
  tags
}: CompanyOverviewPropsType) {
  const { id: companyId } = useParams()
  const [form] = Form.useForm()
  const { isUpdatePending, updateCompany } = useUpdateCompany(form)
  const { isTagEntityStoring, storeTagEntity } = useStoreTagEntity(Number(companyId))
  const { deleteTagEntity, isTagEntityDeleting } = useDeleteTagEntity()
  const { messageApi } = useContext(NotifyContext)

  const handleCompanyUpdate = async () => {
    const values = await form.validateFields()
    const formattedData = formatModuleFieldsValues(fields, values)
    formattedData.id = companyId

    await updateCompany(formattedData)
    refetchCompany()
  }

  const handleAddTag = async (tag: string) => {
    const tagEntityData = {
      company_id: companyId,
      title: tag
    }
    await storeTagEntity(tagEntityData)

    refetchCompany()
    refetchTags()
  }

  const handleRemoveTag = async (tag: string) => {
    const tagToDelete = tags.find(item => item.slug === tag)

    if (!tagToDelete) return messageApi?.error('Tag not found.')

    const deleteData = {
      company_id: companyId,
      tag_id: tagToDelete?.id
    }

    const { data, status } = await deleteTagEntity(deleteData).catch(
      (error: Response<ValidationType<unknown>>) => error
    )

    if (status === 'error') {
      return messageApi?.error((data as string) || 'Could not remove tag.')
    }

    refetchCompany()
    refetchTags()
    return messageApi?.success((data as string) || 'Tag removed successfully.')
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
      <div className="col-span-2 rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <div className="sticky top-0 z-10 flex items-center justify-end rounded-t-md border-0 border-b border-solid border-[#EBEAFF] bg-white px-4 py-2 dark:border-neutral-700 dark:bg-neutral-900">
          <Button
            className="rounded-full"
            loading={isUpdatePending}
            onClick={handleCompanyUpdate}
            size="large"
            type="primary"
          >
            {__('Update')}
          </Button>
        </div>
        <EntityForm<CompanyType, FieldItem>
          className="p-4"
          columnSettings={columnSettings}
          entity={company}
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
                  disabled={!checkCapability(CAPABILITIES.COMPANY.UPDATE)}
                  loading={isTagEntityDeleting || isTagEntityStoring}
                  onAddTag={handleAddTag}
                  onRemoveTag={handleRemoveTag}
                  options={tags?.map(tag => ({ label: tag.title, value: tag.slug }))}
                  value={company?.tags?.map(option => option.slug)}
                />
              ),
              key: 'tags',
              label: <span className="text-slate-500">{__('Tags')}</span>
            },
            {
              children: <Timeline entityId={company?.id} module={MODULES.COMPANY} />,
              key: 'timeline',
              label: <span className="text-slate-500">{__('Timeline')}</span>
            }
          ]}
        />
      </div>
    </div>
  )
}
