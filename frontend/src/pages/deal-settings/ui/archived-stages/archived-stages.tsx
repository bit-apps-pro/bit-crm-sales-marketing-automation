import { LoadingOutlined } from '@ant-design/icons'
import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Button, Typography } from 'antd'
import { LuArchiveRestore } from 'react-icons/lu'

import useArchivedStages from './data/use-archived-stages'
import useUnarchiveStage from './data/use-unarchive-stage'
import ArchivedStagesTable from './internal/archived-stages-table'
import useSelectedStageKeysStore from './state/use-selected-stage-keys-store'

export default function ArchivedStages() {
  const { archivedStages, isArchivedStagesFetching, isArchivedStagesLoading } = useArchivedStages()
  const { isUnarchivingStage, unarchiveStage } = useUnarchiveStage()
  const { clearSelectedKeys, selectedKeys } = useSelectedStageKeysStore()

  const handleBulkUnarchive = async () => {
    if (selectedKeys.length === 0) return

    await unarchiveStage(selectedKeys)
    clearSelectedKeys()
  }

  return (
    <div>
      <div className="flex items-center gap-2 rounded-t-md border border-b-0 border-solid border-[#EBEAFF] bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex items-center gap-5">
          <Typography.Title className="mb-1" level={4}>
            {__(' Archived Stages')}
          </Typography.Title>
          <If conditions={isArchivedStagesFetching}>
            <LoadingOutlined />
          </If>
        </div>
        <If conditions={selectedKeys.length > 0}>
          <Button
            className="rounded-full shadow-none"
            disabled={isUnarchivingStage}
            icon={<LuArchiveRestore />}
            onClick={handleBulkUnarchive}
            type="primary"
          >
            {__('Unarchive') + (selectedKeys.length > 0 ? ` (${selectedKeys.length})` : '')}
          </Button>
        </If>
      </div>
      <ArchivedStagesTable data={archivedStages} loading={isArchivedStagesLoading} />
    </div>
  )
}
