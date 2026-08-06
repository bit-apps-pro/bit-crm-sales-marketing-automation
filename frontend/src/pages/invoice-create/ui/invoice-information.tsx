import { __ } from '@common/helpers/i18nWrap'
import { Button, type FormInstance, Input, Select } from 'antd'
import { DatePicker, Form } from 'antd'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import { LuSettings } from 'react-icons/lu'
import { Link } from 'react-router'

import { type TermsOptions } from '../data/use-invoice-terms'
import useInvoiceTerms from '../data/use-invoice-terms'
import { type InvoiceFormType } from '../shared/invoice-create-types'

interface InvoiceInformationProps {
  form: FormInstance<InvoiceFormType>
}

export default function InvoiceInformation({ form }: InvoiceInformationProps) {
  const { isTermsLoading, terms } = useInvoiceTerms()
  const invoiceDate = Form.useWatch('invoiceDate', form)
  const invoiceTermKey = Form.useWatch('invoiceTerm', form)

  useEffect(() => {
    form.setFieldValue('invoiceDate', dayjs())
    form.setFieldValue('invoicePrefix', form.getFieldValue('invoicePrefix') || 'INV')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleTermChange(value: string, option?: TermsOptions | TermsOptions[]) {
    if (option === undefined || Array.isArray(option)) return
    if (value === 'custom') return
    const dueDate = invoiceDate ? dayjs(invoiceDate).add(option.days, 'day') : undefined
    form.setFieldValue('dueDate', dueDate)
  }

  return (
    <Form className="" form={form} labelCol={{ span: 14 }}>
      <Form.Item
        label={__('Invoice Number:')}
        name="invoicePrefix"
        rules={[
          { message: __('Invoice prefix is required'), required: true },
          {
            message: __('Invoice prefix cannot contain spaces'),
            pattern: /^\S*$/ // Regex: No spaces allowed (only non-whitespace characters)
          }
        ]}
      >
        <Input classNames={{ input: '!min-h-0' }} placeholder={__('INV')} suffix={'-{id}'} />
      </Form.Item>
      <Form.Item
        className="ml-auto"
        label={__('Invoice Date')}
        name="invoiceDate"
        rules={[{ message: __('Invoice date is required'), required: true }]}
      >
        <DatePicker className="w-full" format={'YYYY-MM-DD'} />
      </Form.Item>
      <Form.Item label={__('Terms')} name="invoiceTerm">
        <Select
          loading={isTermsLoading}
          onChange={handleTermChange}
          options={terms}
          placeholder={__('Select Time')}
          popupRender={menu => (
            <>
              {menu}
              <div className="flex items-center justify-center p-1">
                <Link target="_blank" to={'/settings/invoice-settings?tab=configure-payment-terms'}>
                  <Button className="border-none shadow-none" icon={<LuSettings />} size="large">
                    {__('Configure')}
                  </Button>
                </Link>
              </div>
            </>
          )}
          size="middle"
          value={invoiceTermKey === '' ? undefined : invoiceTermKey}
        />
      </Form.Item>
      <Form.Item
        className="ml-auto"
        label={__('Due Date')}
        name="dueDate"
        rules={[{ message: __('Due date is required'), required: true }]}
      >
        <DatePicker
          className="w-full"
          disabled={!invoiceDate}
          format={'YYYY-MM-DD'}
          minDate={dayjs(invoiceDate)}
          onChange={() => {
            form.setFieldValue('invoiceTerm', 'custom')
          }}
        />
      </Form.Item>
    </Form>
  )
}
