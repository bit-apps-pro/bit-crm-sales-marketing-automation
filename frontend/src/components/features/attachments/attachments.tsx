import { LoadingOutlined } from '@ant-design/icons'
import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import Pagination from '@utilities/pagination'
import SearchInput from '@utilities/search-input'
import { Button, Typography } from 'antd'
import { useState } from 'react'
import { LuPlus } from 'react-icons/lu'
import { useSearchParams } from 'react-router'
import { useDebounce } from 'react-use'

import useAttachments from './data/use-attachments'
import useAttachmentFeatureStore from './state/use-attachment-feature-store'
import AttachmentCreateModal from './ui/attachment-create-modal'
import AttachmentTable from './ui/attachment-table'

interface AttachmentsProps {
  entityId: number
  module: string
}

export default function Attachments({ entityId, module }: AttachmentsProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const [searchDebounced, setSearchDebounced] = useState(search)
  const { handleModal } = useAttachmentFeatureStore()
  const page = searchParams.get('page') || 1
  const perPage = searchParams.get('perPage') || 20
  const { attachments, isFetchingAttachments, isRefetchingAttachments, total } = useAttachments(
    module,
    entityId,
    page,
    perPage,
    searchDebounced
  )

  useDebounce(() => setSearchDebounced(search), 300, [search])

  return (
    <div className="rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex justify-between gap-2 p-2">
        <div className="flex items-center gap-2">
          <Typography.Title className="mb-0" level={5}>
            {__('Attachments')}
          </Typography.Title>
          <Button
            className="rounded-full"
            icon={<LuPlus />}
            onClick={() => handleModal('open', setSearchParams, { modal: 'attachment_create' })}
            type="primary"
          >
            {__('New')}
          </Button>
          <If conditions={isFetchingAttachments || isRefetchingAttachments}>
            <LoadingOutlined />
          </If>
        </div>

        <SearchInput placeholder={__('Search by file name')} queryKey="search" />
      </div>
      <div>
        <AttachmentTable attachments={attachments} loading={isFetchingAttachments} />
        <div className="flex justify-center py-2">
          <Pagination defaultPerPage={20} pageSizeOptions={[20, 50, 100]} size="small" total={total} />
        </div>
      </div>
      <AttachmentCreateModal entityId={entityId} module={module} />
    </div>
  )
}
