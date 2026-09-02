import { LoadingOutlined } from '@ant-design/icons'
import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import SettingsPageHeader from '@utilities/settings-page-header'
import { Button, Pagination } from 'antd'
import { LuPlus } from 'react-icons/lu'
import { useNavigate, useParams, useSearchParams } from 'react-router'

import useImaps from './data/use-imaps'
import ImapSkeleton from './internal/imap-skeleton'
import useImapStore from './state/use-imap-store'
import ImapCreateModal from './ui/imap-create-modal'
import ImapEditModal from './ui/imap-edit-modal'
import ImapList from './ui/imap-list'

export default function ImapSettings() {
  const { handleModal } = useImapStore()
  const [, setSearchParams] = useSearchParams()
  const { page } = useParams()
  const pageNo = Number(page) || 1
  const { imaps, isImapsLoading, isRefetchingImaps } = useImaps(pageNo)
  const navigate = useNavigate()

  const handlePageChange = (page: number) => {
    navigate(`/settings/imap-settings/${page}`)
  }

  return (
    <div className="">
      <SettingsPageHeader title={__('IMAP Configurations')}>
        <If conditions={checkCapability(CAPABILITIES.SETTING.IMAP)}>
          <Button
            className="rounded-full"
            icon={<LuPlus />}
            onClick={() => handleModal('open', setSearchParams, { modal: 'create' })}
            size="large"
            type="primary"
          >
            {__('New')}
          </Button>
        </If>
        <If conditions={isRefetchingImaps}>
          <LoadingOutlined />
        </If>
      </SettingsPageHeader>

      <div className="mt-4 px-4">
        <div>
          {isImapsLoading && checkCapability(CAPABILITIES.SETTING.IMAP) ? (
            <ImapSkeleton quantity={5} />
          ) : (
            <ImapList imaps={imaps?.data || []} />
          )}
        </div>

        <If conditions={imaps && imaps.total > imaps.per_page}>
          <Pagination
            align="end"
            className="me-6 mt-4"
            current={pageNo}
            onChange={handlePageChange}
            pageSize={imaps?.per_page}
            total={imaps?.total}
          />
        </If>
      </div>

      <ImapCreateModal />
      <ImapEditModal />
    </div>
  )
}
