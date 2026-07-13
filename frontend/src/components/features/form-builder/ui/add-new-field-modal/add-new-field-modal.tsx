import { __ } from '@common/helpers/i18nWrap'
import { ProBanner } from '@utilities/pro-feature-alert'
import { Button, Modal } from 'antd'
import { type FC } from 'react'
import { LuPlus } from 'react-icons/lu'

import { type AddNewFieldModalPropsType } from '../../shared/field-types'
import { useAddFieldModalActions, useIsAddFieldModalOpen } from '../../state/use-add-field-modal-store'

const AddNewFieldModal: FC<AddNewFieldModalPropsType> = () => {
  const isModalOpen = useIsAddFieldModalOpen()
  const { setModalOpen } = useAddFieldModalActions()

  return (
    <>
      <Button icon={<LuPlus size={14} />} onClick={() => setModalOpen(true)}>
        {__('Add new custom field')}
      </Button>

      <Modal
        footer={false}
        onCancel={() => setModalOpen(false)}
        open={isModalOpen}
        title={__('Add new custom field')}
      >
        <ProBanner featureName={__('Custom Fields')} />
      </Modal>
    </>
  )
}

export default AddNewFieldModal
