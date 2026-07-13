import { formatModuleFieldsValues } from '@common/helpers/format-module-fields-values'
import { __ } from '@common/helpers/i18nWrap'
import ConversionForm from '@pages/lead/ui/conversion-form'
import {
  useLeadStoreKeysActions,
  useLeadStoreSelectedKeys
} from '@pages/leads/state/use-selected-lead-keys-store'
import If from '@utilities/If'
import { Button, Form, Modal, Popover } from 'antd'
import { LuInfo, LuTable, LuUsers } from 'react-icons/lu'
import { Link } from 'react-router'

import useConvertLeads from '../data/use-convert-leads'
import useLeadBulkOperationsStore from '../state/use-lead-bulk-operations-store'

export default function ConversionModal() {
  const [form] = Form.useForm()

  const { isConversionModalOpen, setConversionModalOpen } = useLeadBulkOperationsStore()
  const selectedLeadKeys = useLeadStoreSelectedKeys()
  const { setSelectedKeys } = useLeadStoreKeysActions()

  const { convertLeads, isConvertingLeads } = useConvertLeads()

  const handleConfirm = async () => {
    const values = await form.validateFields()
    const { dealFieldOverrides, dealFields, ...rest } = values ?? {}
    const formattedDealFieldOverrides = formatModuleFieldsValues(dealFields, dealFieldOverrides)

    const payload = {
      ...rest,
      dealFieldOverrides: formattedDealFieldOverrides,
      ids: selectedLeadKeys
    }

    await convertLeads(payload)
    form.resetFields()
    setConversionModalOpen(false)
    setSelectedKeys([])
  }

  return (
    <Modal
      footer={[
        <Button icon={<LuTable size={14} />} key="mapping">
          <Link target="_blank" to="/settings/lead-settings?tab=conversion-mapping">
            {__('Field Mapping')}
          </Link>
        </Button>,
        <Button key="cancel" onClick={() => setConversionModalOpen(false)}>
          {__('Cancel')}
        </Button>,
        <Button
          icon={<LuUsers size={14} />}
          key="convert"
          loading={isConvertingLeads}
          onClick={handleConfirm}
          type="primary"
        >
          {__('Convert')}
        </Button>
      ]}
      onCancel={() => setConversionModalOpen(false)}
      open={isConversionModalOpen}
      styles={{
        body: {
          marginInline: '-22px',
          maxHeight: '70vh',
          overflowY: 'auto',
          paddingInline: '22px'
        }
      }}
      title={
        <div className="flex items-center justify-start gap-2">
          {__('Convert Leads')}
          <Popover
            content={
              <div>
                <h4 className="font-semibold">{__('What happens during conversion:')}</h4>
                <ul className="ml-4 mt-2 list-disc space-y-1">
                  <li>{__('New contacts, companies, deals are created via field mapping.')}</li>
                  <li>
                    {__('Optionally, a deal can be created and linked to the contact and company.')}
                  </li>
                  <li>{__('Leads are marked as converted but original data remains unchanged.')}</li>
                  <li>{__('Related data moves to selected module (contact, company or deal).')}</li>
                  <li>{__('Tags can be copied to one or more modules.')}</li>
                  <li>{__('Lead owner assigned unless specified.')}</li>
                </ul>
              </div>
            }
            placement="rightBottom"
          >
            <span className="flex items-center">
              <LuInfo />
            </span>
          </Popover>
        </div>
      }
      width={700}
    >
      <If conditions={isConversionModalOpen}>
        <ConversionForm form={form} />
      </If>
    </Modal>
  )
}
