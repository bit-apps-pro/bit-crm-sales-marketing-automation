import { LoadingOutlined } from '@ant-design/icons'
import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Button, Pagination, Typography } from 'antd'
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
  const { imaps, isFetchingImaps, isRefetchingImaps } = useImaps(pageNo)
  const navigate = useNavigate()

  const handlePageChange = (page: number) => {
    navigate(`/settings/imap-settings/${page}`)
  }

  return (
    <div className="">
      <div className="flex items-center gap-2 border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-neutral-700">
        <Typography.Title className="mb-0" level={3}>
          {__('IMAP Configurations')}
        </Typography.Title>
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
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="mt-6 flex gap-4">
          {isFetchingImaps && checkCapability(CAPABILITIES.SETTING.IMAP) ? (
            <ImapSkeleton quantity={3} />
          ) : (
            <ImapList imaps={imaps?.data || []} />
          )}
        </div>

        <If conditions={imaps && imaps.total > imaps.per_page}>
          <Pagination
            align="end"
            className="mr-6 mt-4"
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
