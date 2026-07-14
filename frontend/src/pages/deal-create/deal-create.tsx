import { CaretRightOutlined } from '@ant-design/icons'
import { MODULES } from '@common/constants/modules'
import { $appConfig } from '@common/globalStates'
import { formatModuleFieldsValues } from '@common/helpers/format-module-fields-values'
import { __ } from '@common/helpers/i18nWrap'
import useCurrencyData from '@common/hooks/use-currency-data'
import useTags from '@common/hooks/use-tags'
import AssignProductModal from '@features/assign-product-modal'
import DealProductList from '@features/deal-product-list'
import EntityCreateSkeleton from '@features/entity-form/ui/entity-create-skeleton'
import EntityForm from '@features/entity-form/ui/entity-form'
import EntityTags from '@features/entity-overview/ui/entity-tags'
import { formatLineItems } from '@features/product-line-items/shared/helpers'
import {
  useGrossDiscountSelect,
  useGrossDiscountTypeSelect,
  useLineItemsSelect,
  useLineItemsStoreActions,
  useTaxOptionSelect
} from '@features/product-line-items/state/use-line-items-store'
import useDealStages from '@pages/deals/internal/deals-kanban/data/use-deal-stages'
import Breadcrumb from '@utilities/breadcrumb/breadcrumb'
import { Button, Collapse, Form, type FormInstance, Tag, Tooltip, Typography } from 'antd'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { LuSettings } from 'react-icons/lu'
import { Link, useSearchParams } from 'react-router'

import useDealFields from './data/use-deal-fields'
import useStoreDeal from './data/use-store-deal'
import AmountFieldWithToggle from './ui/amount-field-with-toggle'
import CompanySelect from './ui/company-select'
import ContactSelect from './ui/contact-select'

const BREADCRUMB_ITEMS = [
  {
    title: __('Deals'),
    to: '/deals'
  },
  {
    title: __('Create Deal')
  }
]

const DealCreate = () => {
  const [tagIds, setTagIds] = useState<number[]>([])
  const [newTagTitles, setNewTagTitles] = useState<string[]>([])
  const [form] = Form.useForm()
  const [searchParams] = useSearchParams()
  const stage = searchParams.get('stage') || ''
  const contactId = searchParams.get('contactId') || ''
  const companyId = searchParams.get('companyId') || ''

  const { columnSettings, fields, isFieldsFetching } = useDealFields()
  const { isTagsPending, refetchTags, tags } = useTags({ module: MODULES.DEAL })
  const { isCreateAndAddPending, isCreatePending, storeDeal } = useStoreDeal(form)
  const { stages } = useDealStages()
  const lineItems = useLineItemsSelect()
  const taxOption = useTaxOptionSelect()
  const grossDiscount = useGrossDiscountSelect()
  const grossDiscountType = useGrossDiscountTypeSelect()
  const { homeCurrencyData } = useAtomValue($appConfig)
  const currency = useCurrencyData(fields, form)
  const { clearStore: clearLineItems } = useLineItemsStoreActions()

  const stageValue = Form.useWatch('stage', form)

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

      const formattedDealValues = formatModuleFieldsValues(fields, values)
      formattedDealValues.systemDefinedFieldsValues.tax_option = taxOption
      formattedDealValues.systemDefinedFieldsValues.gross_discount_amount = String(grossDiscount)
      formattedDealValues.systemDefinedFieldsValues.gross_discount_type = grossDiscountType
      const formattedLineItems = formatLineItems(lineItems)

      const dealData = {
        ...formattedDealValues,
        lineItems: formattedLineItems,
        newTagTitles,
        nextAction,
        tagIds
      }

      await storeDeal(dealData)
      clearLineItems()
      resetTagState()
    },
    [
      fields,
      newTagTitles,
      tagIds,
      storeDeal,
      resetTagState,
      lineItems,
      clearLineItems,
      taxOption,
      grossDiscount,
      grossDiscountType
    ]
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

  useEffect(() => {
    if (contactId) form.setFieldValue('contact_id', contactId)
    if (companyId) form.setFieldValue('company_id', companyId)
  }, [contactId, companyId, form])

  useEffect(() => {
    const activeStage = stageValue || stage
    if (!activeStage || stages.length === 0) return

    const selectedStage = stages.find(s => s.key === activeStage)
    if (!selectedStage) return

    const probability = String(selectedStage.probability)

    if (stageValue) {
      form.setFieldValue('probability', probability)
    } else {
      form.setFieldsValue({ probability, stage: activeStage })
    }
  }, [stageValue, stage, stages, form])

  useEffect(() => {
    form.setFieldValue('currency', homeCurrencyData.currency)
  }, [form, homeCurrencyData.currency])

  useEffect(() => {
    return () => {
      clearLineItems()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4 rounded-md px-5 py-4">
      <Breadcrumb items={BREADCRUMB_ITEMS} />

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
        {isFieldsFetching ? (
          <EntityCreateSkeleton />
        ) : (
          <div className="col-span-2 rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-md border-0 border-b border-solid border-[#EBEAFF] bg-white px-4 py-2 dark:border-neutral-700 dark:bg-neutral-900">
              <div className="flex items-center gap-2">
                <Typography.Title className="mb-0" level={4}>
                  {__('Create Deal')}
                </Typography.Title>
                <Tooltip title={__('Field Settings')}>
                  <Link target="_blank" to="/settings/deal-settings">
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
            <EntityForm
              className="p-4"
              columnSettings={columnSettings}
              currencyData={currency}
              fields={fields}
              form={form}
              specialComponents={{
                amount: <AmountFieldWithToggle currencyData={currency} form={form} />,
                company_id: <CompanySelect form={form} />,
                contact_id: <ContactSelect form={form} />
              }}
            />
            <AssignProductModal currencyData={currency} form={form} />
          </div>
        )}

        <div className="rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-transparent">
          <Collapse
            bordered={false}
            className="bg-white dark:bg-neutral-900"
            defaultActiveKey={['tags', 'products']}
            expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
            items={[
              {
                children: (
                  <EntityTags
                    loading={isTagsPending}
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                    options={tagOptions}
                    value={selectedTagValues}
                  />
                ),
                key: 'tags',
                label: <span className="text-slate-500">{__('Tags')}</span>
              },
              {
                children: <DealProductList currencyData={currency} />,
                key: 'products',
                label: (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500">{__('Product List')}</span>
                    <Tag className="mr-0" color="geekblue">
                      {lineItems.length} {__('Products')}
                    </Tag>
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>
    </div>
  )
}

export default DealCreate
