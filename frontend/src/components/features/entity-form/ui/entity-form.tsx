import { cn } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import EntityQuickCreateModal from '@features/entity-quick-create'
import { WIDTH_FULL, WIDTH_HALF } from '@features/form-builder/shared/constants'
import customizedRequiredMark from '@utilities/customized-required-mark'
import { Divider, Form } from 'antd'
import { type Store } from 'antd/es/form/interface'
import { Fragment } from 'react'

import { type BaseFieldItemType, type EntityFormPropsType } from '../shared/entity-form-types'
import EntityInput from './entity-input'

const getFormItemClassName = (
  fieldWidth: string | undefined,
  columnSettings?: boolean | { column_size: number }
): string => {
  if (typeof fieldWidth === 'string' && fieldWidth === WIDTH_HALF) {
    return 'col-span-1'
  }

  if (
    (typeof fieldWidth === 'string' && fieldWidth === WIDTH_FULL) ||
    (typeof columnSettings === 'object' && columnSettings?.column_size === 1)
  ) {
    return 'col-span-full'
  }

  return 'col-span-1'
}

export default function EntityForm<T extends Store | undefined, Y extends BaseFieldItemType>({
  children,
  className = '',
  columnSettings,
  currencyData,
  enableQuickCreate = true,
  entity,
  fields,
  form,
  specialComponents
}: EntityFormPropsType<T, Y>) {
  return (
    <Form
      className={cn([className, 'space-y-2'])}
      form={form}
      initialValues={entity}
      layout="vertical"
      requiredMark={customizedRequiredMark}
    >
      {(() => {
        const elements: JSX.Element[] = []
        let currentSectionFields: JSX.Element[] = []
        let sectionIndex = 0

        const flushCurrentSection = () => {
          if (currentSectionFields.length > 0) {
            elements.push(
              <div className="grid grid-cols-2 gap-4" key={`section-fields-${sectionIndex}`}>
                {currentSectionFields}
              </div>
            )
            currentSectionFields = []
            sectionIndex++
          }
        }

        fields.forEach(field => {
          if (field.group_fields) {
            flushCurrentSection()

            elements.push(
              <Fragment key={field.field_key}>
                <Divider className="mb-0 mt-4 first:mt-0" orientation="left" orientationMargin="0">
                  {__(field.label)}
                </Divider>
                <div className="grid grid-cols-2 gap-4">
                  {Object.values(field.group_fields).map(field => (
                    <EntityInput
                      currencyData={currencyData}
                      enableQuickCreate={enableQuickCreate}
                      field={field}
                      key={field.field_key}
                      specialComponents={specialComponents}
                    />
                  ))}
                </div>
              </Fragment>
            )
            return
          }

          if (field.type === 'section') {
            flushCurrentSection()

            elements.push(
              <Divider
                className="mb-0 mt-4 first:mt-0"
                key={field.field_key}
                orientation="left"
                orientationMargin="0"
              >
                {__(field.label)}
              </Divider>
            )
            return
          }

          currentSectionFields.push(
            <EntityInput
              currencyData={currencyData}
              enableQuickCreate={enableQuickCreate}
              field={field}
              formItemClassName={getFormItemClassName(field?.width, columnSettings)}
              key={field.field_key}
              specialComponents={specialComponents}
            />
          )
        })

        flushCurrentSection()

        return elements
      })()}

      {children}

      {enableQuickCreate && <EntityQuickCreateModal currencyData={currencyData} form={form} />}
    </Form>
  )
}
