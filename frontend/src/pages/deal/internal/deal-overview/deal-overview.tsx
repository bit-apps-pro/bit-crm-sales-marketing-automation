import { CaretRightOutlined } from '@ant-design/icons'
import CAPABILITIES from '@common/constants/capabilities'
import { MODULES } from '@common/constants/modules'
import NotifyContext from '@common/context/NotifyContext'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { formatModuleFieldsValues } from '@common/helpers/format-module-fields-values'
import { __ } from '@common/helpers/i18nWrap'
import useCurrencyData from '@common/hooks/use-currency-data'
import AssignProductModal from '@features/assign-product-modal'
import DealProductList from '@features/deal-product-list'
import EntityForm from '@features/entity-form/ui/entity-form'
import EntityTags from '@features/entity-overview/ui/entity-tags'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import { TAX } from '@features/product-line-items/shared/constants'
import { formatLineItems } from '@features/product-line-items/shared/helpers'
import { type LineItem } from '@features/product-line-items/shared/types'
import {
  useGrossDiscountSelect,
  useGrossDiscountTypeSelect,
  useLineItemsStoreActions,
  useTaxOptionSelect
} from '@features/product-line-items/state/use-line-items-store'
import Timeline from '@features/timeline'
import AmountFieldWithToggle from '@pages/deal-create/ui/amount-field-with-toggle'
import CompanySelect from '@pages/deal-create/ui/company-select'
import ContactSelect from '@pages/deal-create/ui/contact-select'
import useStages from '@pages/deal-settings/ui/stages/data/use-stages'
import { type Deal, type DealOverviewProps } from '@pages/deal/shared/deal-types'
import { useDealsKanbanActionsStore } from '@pages/deals/internal/deals-kanban/state/use-deals-kanban-store'
import UpdateDealStageModal from '@pages/deals/internal/deals-kanban/ui/update-deal-stage-modal'
import { Button, Collapse, Form, Tag } from 'antd'
import { useContext, useEffect, useMemo } from 'react'
import { useParams } from 'react-router'

import useDeleteTagEntity from './data/use-delete-tag-entity'
import useStoreTagEntity from './data/use-store-tag-entity'
import { type UpdateDealPayload } from './data/use-update-deal'
import useUpdateDeal from './data/use-update-deal'
import DealDatesInfo from './ui/deal-dates-info'
import StageSelectBar from './ui/stage-select-bar'

export default function DealOverview({ columnSettings, deal, fields, tags }: DealOverviewProps) {
  const { id: dealId } = useParams()
  const [form] = Form.useForm()
  const { isUpdatePending, updateDeal } = useUpdateDeal(form)
  const { isTagEntityStoring, storeTagEntity } = useStoreTagEntity(Number(dealId))
  const { stages } = useStages()
  const { deleteTagEntity, isTagEntityDeleting } = useDeleteTagEntity()
  const { messageApi } = useContext(NotifyContext)
  const { clearStore } = useDealsKanbanActionsStore()
  const currency = useCurrencyData(fields, form)
  const {
    clearStore: clearLineItems,
    setGrossDiscount,
    setGrossDiscountType,
    setLineItems,
    setTaxOption
  } = useLineItemsStoreActions()
  const taxOption = useTaxOptionSelect()
  const grossDiscount = useGrossDiscountSelect()
  const grossDiscountType = useGrossDiscountTypeSelect()
  const stageValue = Form.useWatch('stage', form)

  const lineItems: LineItem[] = useMemo(() => {
    if (!deal?.lineItems || deal.lineItems.length === 0) return []

    return deal.lineItems.filter(item => item.product_id)
  }, [deal?.lineItems])

  const handleDealUpdate = async () => {
    const values = await form.validateFields()
    const formattedData = formatModuleFieldsValues(fields, values)
    formattedData.id = dealId

    await updateDeal(formattedData)
    clearStore()
  }

  const handleSaveLineItems = async (lineItems: LineItem[], amount: number) => {
    const values = await form.validateFields()

    const formattedData: UpdateDealPayload = formatModuleFieldsValues(fields, values)
    const formattedLineItems = formatLineItems(lineItems)

    formattedData.id = dealId
    formattedData.systemDefinedFieldsValues.amount = String(amount)
    formattedData.systemDefinedFieldsValues.tax_option = taxOption
    formattedData.systemDefinedFieldsValues.gross_discount_amount = String(grossDiscount)
    formattedData.systemDefinedFieldsValues.gross_discount_type = grossDiscountType
    formattedData.lineItems = formattedLineItems

    await updateDeal(formattedData)
  }

  const handleAddTag = async (tag: string) => {
    const tagEntityData = {
      deal_id: dealId,
      title: tag
    }
    await storeTagEntity(tagEntityData)
  }

  const handleRemoveTag = async (tag: string) => {
    const tagToDelete = tags.find(item => item.slug === tag)
    if (!tagToDelete) return messageApi?.error('Tag not found.')

    const deleteData = {
      deal_id: dealId,
      tag_id: tagToDelete?.id
    }
    await deleteTagEntity(deleteData)
  }

  const dealFields = useMemo(
    () =>
      fields.map(field => ({
        ...field,
        status: field.field_key === 'probability' ? false : field.status
      })),
    [fields]
  )

  useEffect(() => {
    if (!deal) return

    form.setFieldsValue({
      amount: deal.amount,
      company_id: deal.company_id,
      contact_id: deal.contact_id,
      probability: deal.probability,
      stage: deal.stage
    })
  }, [deal, form])

  useEffect(() => {
    if (!stageValue || stages.length === 0) return

    const isStageChanged = stageValue !== deal?.stage
    const selectedStage = stages.find(s => s.key === stageValue)

    const probability = isStageChanged ? selectedStage?.probability : deal?.probability

    if (probability !== undefined) {
      form.setFieldValue('probability', String(probability))
    }
  }, [stageValue, stages, form, deal])

  useEffect(() => {
    setLineItems(lineItems)
    setTaxOption(deal?.tax_option || TAX.EXCLUSIVE)
    setGrossDiscount(Number(deal?.gross_discount_amount) || 0)
    setGrossDiscountType(deal?.gross_discount_type || 'amount')
    return () => {
      clearLineItems()
    }
  }, [
    clearLineItems,
    lineItems,
    deal?.tax_option,
    deal?.gross_discount_amount,
    deal?.gross_discount_type,
    setLineItems,
    setTaxOption,
    setGrossDiscount,
    setGrossDiscountType
  ])

  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
      <div className="col-span-2 rounded-md border border-solid border-[#E5E3FE] bg-white dark:border-neutral-700 dark:bg-transparent">
        <div className="sticky top-0 z-10 space-y-2 rounded-t-md border-0 bg-white py-2 dark:bg-transparent">
          <div className="flex items-center justify-between px-4">
            <DealDatesInfo closedAt={deal?.closed_at} createdAt={deal?.created_at} />
            <Button
              className="rounded-full"
              loading={isUpdatePending}
              onClick={handleDealUpdate}
              size="large"
              type="primary"
            >
              {__('Update')}
            </Button>
          </div>
          <StageSelectBar deal={deal} />
        </div>

        <EntityForm<Deal, FieldItem>
          className="p-4"
          columnSettings={columnSettings}
          currencyData={currency}
          entity={deal}
          fields={dealFields}
          form={form}
          specialComponents={{
            amount: <AmountFieldWithToggle currencyData={currency} form={form} />,
            company_id: <CompanySelect form={form} />,
            contact_id: <ContactSelect form={form} />
          }}
        />

        <AssignProductModal
          currencyData={currency}
          form={form}
          loading={isUpdatePending}
          onSave={handleSaveLineItems}
        />
      </div>

      <div className="rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-transparent">
        <Collapse
          bordered={false}
          className="bg-white dark:bg-neutral-900"
          defaultActiveKey={['tags', 'products', 'timeline']}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          items={[
            {
              children: (
                <EntityTags
                  disabled={!checkCapability(CAPABILITIES.DEAL.UPDATE)}
                  loading={isTagEntityDeleting || isTagEntityStoring}
                  onAddTag={handleAddTag}
                  onRemoveTag={handleRemoveTag}
                  options={tags?.map(tag => ({ label: tag.title, value: tag.slug }))}
                  value={deal?.tags?.map(option => option.slug)}
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
            },
            {
              children: <Timeline entityId={deal?.id} module={MODULES.DEAL} />,
              key: 'timeline',
              label: <span className="text-slate-500">{__('Timeline')}</span>
            }
          ]}
        />
      </div>

      <UpdateDealStageModal />
    </div>
  )
}
