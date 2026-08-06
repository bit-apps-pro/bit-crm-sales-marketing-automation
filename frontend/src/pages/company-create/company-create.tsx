import { formatModuleFieldsValues } from '@common/helpers/format-module-fields-values'
import { __ } from '@common/helpers/i18nWrap'
import EntityCreateSkeleton from '@features/entity-form/ui/entity-create-skeleton'
import EntityForm from '@features/entity-form/ui/entity-form'
import EntityTags from '@features/entity-overview/ui/entity-tags'
import useCompanyModuleTags from '@pages/company/data/use-company-module-tags'
import Breadcrumb from '@utilities/breadcrumb/breadcrumb'
import { Button, type FormInstance, Tooltip } from 'antd'
import { Form, Typography } from 'antd'
import { useCallback, useMemo, useState } from 'react'
import { LuSettings } from 'react-icons/lu'
import { Link } from 'react-router'

import useCompanyFields from './data/use-company-fields'
import useStoreCompany from './data/use-store-company'

const BREADCRUMB_ITEMS = [
  {
    title: __('Companies'),
    to: '/companies'
  },
  {
    title: __('Create Company')
  }
]

const CompanyCreate = () => {
  const [tagIds, setTagIds] = useState<number[]>([])
  const [newTagTitles, setNewTagTitles] = useState<string[]>([])
  const [form] = Form.useForm()

  const { columnSettings, fields, isFieldsLoading } = useCompanyFields()
  const { companyModuleTags: tags, isTagsLoading, refetchTags } = useCompanyModuleTags()
  const { isCreateAndAddPending, isCreatePending, storeCompany } = useStoreCompany(form)

  const tagOptions = useMemo(
    () => tags?.map(tag => ({ label: tag.title, value: tag.slug })) || [],
    [tags]
  )

  const selectedTagValues = useMemo(
    () => [...tags.filter(tag => tagIds.includes(tag.id)).map(tag => tag.slug), ...newTagTitles],
    [tags, tagIds, newTagTitles]
  )

  const resetTagState = useCallback(() => {
    setTagIds([])
    if (newTagTitles.length) {
      setNewTagTitles([])
      refetchTags()
    }
  }, [newTagTitles.length, refetchTags])

  const handleSubmit = useCallback(
    async (form: FormInstance, nextAction?: null | string) => {
      const values = await form.validateFields()
      const formattedCompanyValues = formatModuleFieldsValues(fields, values)

      const companyData = {
        ...formattedCompanyValues,
        newTagTitles,
        nextAction,
        tagIds
      }

      await storeCompany(companyData)
      resetTagState()
    },
    [fields, newTagTitles, tagIds, storeCompany, resetTagState]
  )

  const handleAddTag = useCallback(
    (tag: string) => {
      const tagExist = tags.find(item => item.slug === tag)

      if (tagExist?.id) {
        return setTagIds(prev => [...prev, tagExist.id])
      }

      setNewTagTitles(prev => [...prev, tag])
    },
    [tags]
  )

  const handleRemoveTag = useCallback(
    (tag: string) => {
      const tagToRemove = tags.find(item => item.slug === tag)

      if (tagToRemove?.id) {
        return setTagIds(prev => prev.filter(item => item !== tagToRemove.id))
      }

      setNewTagTitles(prev => prev.filter(item => item !== tag))
    },
    [tags]
  )
  return (
    <div className="space-y-4 rounded-md px-5 py-4">
      <Breadcrumb items={BREADCRUMB_ITEMS} />

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
        {isFieldsLoading ? (
          <EntityCreateSkeleton />
        ) : (
          <div className="col-span-2 rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-md border-0 border-b border-solid border-[#EBEAFF] bg-white px-4 py-2 dark:border-neutral-700 dark:bg-neutral-900">
              <div className="flex items-center gap-2">
                <Typography.Title className="mb-0" level={4}>
                  {__('Create Company')}
                </Typography.Title>
                <Tooltip title={__('Field Settings')}>
                  <Link target="_blank" to="/settings/company-settings">
                    <Button
                      className="size-8 shadow-none"
                      classNames={{ icon: ' flex items-center' }}
                      icon={<LuSettings className="text-gray-500" size={14} />}
                      shape="circle"
                    />
                  </Link>
                </Tooltip>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  className="rounded-full"
                  loading={isCreateAndAddPending}
                  onClick={() => handleSubmit(form)}
                  type="text"
                >
                  {__('Create & Add Another')}
                </Button>
                <Button
                  className="rounded-full"
                  loading={isCreatePending}
                  onClick={() => handleSubmit(form, 'create')}
                  size="large"
                  type="primary"
                >
                  {__('Create')}
                </Button>
              </div>
            </div>
            <EntityForm className="p-4" columnSettings={columnSettings} fields={fields} form={form} />
          </div>
        )}

        <div className="rounded-md border border-solid border-[#EBEAFF] bg-white px-4 pb-6 pt-4 dark:border-neutral-700 dark:bg-neutral-900">
          <Typography.Title level={5}>{__('Tags')}</Typography.Title>
          <EntityTags
            loading={isTagsLoading}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            options={tagOptions}
            value={selectedTagValues}
          />
        </div>
      </div>
    </div>
  )
}

export default CompanyCreate
