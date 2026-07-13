import { MODULES } from '@common/constants/modules'
import useDebounce from '@common/hooks/use-debounce'
import AttachmentCreateModal from '@features/attachments/ui/attachment-create-modal'
import CallCreateModal from '@features/calls/ui/call-create-modal'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import LinkCreateModal from '@features/links/ui/link-create-modal'
import MeetingCreateModal from '@features/meetings/ui/meeting-create-modal'
import NoteCreateModal from '@features/notes/ui/note-create-modal'
import TaskCreateModal from '@features/tasks/ui/task-create-modal'
import { type Deal } from '@pages/deal/shared/deal-types'
import useDeals from '@pages/deals/data/use-deals'
import {
  useFieldListStore,
  useIsFieldListLoadingStore
} from '@pages/deals/state/use-deal-table-fields-store'
import If from '@utilities/If'
import KanbanColumnSkeleton from '@utilities/kanban/kanban-column-skeleton'
import { Empty } from 'antd'
import { useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'

import useDealStages from './data/use-deal-stages'
import useLoadMoreStageDeals from './data/use-load-more-stage-deals'
import { type DealsKanbanProps } from './shared/types'
import {
  useDealsKanbanActionsStore,
  useStagePaginationStore,
  useStagesStore
} from './state/use-deals-kanban-store'
import KanbanContext from './ui/kanban-context'
import UpdateDealStageModal from './ui/update-deal-stage-modal'

const generateFieldOptions = (fields: FieldItem[]) => {
  const options: { label: string; value: string }[] = []

  fields.forEach(field => {
    if (field.type === 'section') {
      return
    }

    if (field.group_fields) {
      const nestedOptions = generateFieldOptions(Object.values(field.group_fields))
      options.push(...nestedOptions)
    } else {
      options.push({
        label: field.label,
        value: `{${field.field_key}}`
      })
    }
  })

  return options
}

export default function DealsKanban({ searchData }: DealsKanbanProps) {
  const lastSyncedDealsRef = useRef<Deal[]>([])
  const { isStagesFetching, isStagesPending } = useDealStages()
  const { deals, isDealsPending: isLoading, stageStatistics } = useDeals(searchData)
  const { loadMoreStageDeals } = useLoadMoreStageDeals()
  const fieldList = useFieldListStore()
  const isFieldListLoading = useIsFieldListLoadingStore()
  const [searchParams] = useSearchParams()
  const openId = searchParams.get('id')

  const {
    initializeStagePagination,
    setDealsData,
    setStagePagination,
    setStageStatistics,
    setStageTotalDeals
  } = useDealsKanbanActionsStore()
  const stagePagination = useStagePaginationStore()
  const stages = useStagesStore()

  const loadMore = useCallback(
    async (page: number, stage: string) => {
      const stageValue = stage
      const currentPagination = stagePagination[stageValue]

      if (!currentPagination || currentPagination.isLoading || !currentPagination.hasMore) {
        return
      }

      setStagePagination(stageValue, {
        ...currentPagination,
        isLoading: true
      })

      await loadMoreStageDeals({
        page,
        perPage: 10,
        searchData: {
          ...searchData,
          table: false
        },
        stage: stageValue
      })
    },
    [loadMoreStageDeals, searchData, setStagePagination, stagePagination]
  )
  const handleLoadMore = useDebounce(loadMore, 300)

  useEffect(() => {
    const dealsChanged = JSON.stringify(deals) !== JSON.stringify(lastSyncedDealsRef.current)

    if (dealsChanged && stages.length > 0) {
      setDealsData(deals)
      lastSyncedDealsRef.current = deals
    }
  }, [deals, setDealsData, stages])

  useEffect(() => {
    if (stages.length > 0) {
      const stageKeys = stages.map(stage => stage.key)
      initializeStagePagination(stageKeys)
    }
  }, [initializeStagePagination, stages])

  useEffect(() => {
    if (stageStatistics && Object.keys(stageStatistics).length > 0) {
      const stageCountsFromAPI: Record<string, number> = {}
      const stageAmountsFromAPI: Record<string, number> = {}

      stages.forEach(stage => {
        const stats = stageStatistics[stage.key]
        stageCountsFromAPI[stage.key] = stats?.count || 0
        stageAmountsFromAPI[stage.key] = stats?.totalAmount || 0

        setStageTotalDeals(stage.key, stats?.count || 0, searchData.perPage)
      })
      setStageStatistics({
        stageAmounts: stageAmountsFromAPI,
        stageCounts: stageCountsFromAPI
      })
    }
  }, [stageStatistics, searchData.perPage, stages, setStageStatistics, setStageTotalDeals])

  if (isLoading || isFieldListLoading || isStagesFetching || isStagesPending) {
    return <KanbanColumnSkeleton />
  }

  return (
    <>
      {!stages || stages.length === 0 ? (
        <Empty />
      ) : (
        <>
          <KanbanContext onLoadMore={handleLoadMore} />
          <UpdateDealStageModal />
        </>
      )}

      <If conditions={openId}>
        <AttachmentCreateModal entityId={Number(openId)} module={MODULES.DEAL} />
        <TaskCreateModal
          entityId={Number(openId)}
          fieldOptions={generateFieldOptions(fieldList)}
          module={MODULES.DEAL}
          variant="component"
        />
        <MeetingCreateModal
          entityId={Number(openId)}
          fieldOptions={generateFieldOptions(fieldList)}
          module={MODULES.DEAL}
          variant="component"
        />
        <CallCreateModal
          entityId={Number(openId)}
          fieldOptions={generateFieldOptions(fieldList)}
          module={MODULES.DEAL}
          variant="component"
        />
        <NoteCreateModal
          entityId={Number(openId)}
          fieldOptions={generateFieldOptions(fieldList)}
          module={MODULES.DEAL}
        />
        <LinkCreateModal
          entityId={Number(openId)}
          fieldOptions={generateFieldOptions(fieldList)}
          module={MODULES.DEAL}
        />
      </If>
    </>
  )
}
