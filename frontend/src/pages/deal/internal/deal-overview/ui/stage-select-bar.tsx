import useStages from '@pages/deal-settings/ui/stages/data/use-stages'
import { type StageSelectBarProps } from '@pages/deal/shared/deal-types'
import useUpdateDealStage from '@pages/deals/internal/deals-kanban/data/use-update-deal-stage'
import { useDealsKanbanActionsStore } from '@pages/deals/internal/deals-kanban/state/use-deals-kanban-store'
import { useUpdateDealStageActionsStore } from '@pages/deals/internal/deals-kanban/state/use-update-deal-stage-store'
import If from '@utilities/If'

import StageButton from './stage-button'
import StageSelectBarSkeleton from './stage-select-bar-skeleton'

export default function StageSelectBar({ deal }: StageSelectBarProps) {
  const { stage: currentStage } = deal ?? {}
  const { isStagesFetching, isStagesPending, stages } = useStages()
  const { isUpdatingStage, updateDealStage } = useUpdateDealStage()
  const { handleModal } = useUpdateDealStageActionsStore()
  const { clearStore } = useDealsKanbanActionsStore()

  if (isStagesPending || isStagesFetching) return <StageSelectBarSkeleton />

  const handleStageClick = async (stageKey: string) => {
    if (stageKey === currentStage || isUpdatingStage) {
      return
    }

    const newStage = stages.find(stage => stage?.key === stageKey)

    if (!newStage) {
      return
    }

    if (newStage?.deal_category === 'closed_won' || newStage?.deal_category === 'closed_lost') {
      handleModal(true, {
        deal,
        newStage,
        oldPosition: 0,
        oldStageKey: currentStage || ''
      })
      return
    }

    await updateDealStage({
      id: Number(deal.id),
      probability: newStage.probability,
      stage: stageKey
    })
    clearStore()
  }

  return (
    <If conditions={stages && stages.length > 0}>
      <div className="flex w-full overflow-x-auto">
        <div
          className="flex gap-[3px] border border-solid border-slate-200 p-[3px] dark:border-transparent"
          style={{ minWidth: '100%' }}
        >
          {stages.map((stage, index) => {
            const isFirst = index === 0
            const isLast = index === stages.length - 1

            return (
              <StageButton
                currentStageKey={currentStage}
                disabled={isUpdatingStage}
                isFirst={isFirst}
                isLast={isLast}
                key={stage.key}
                onClick={handleStageClick}
                stage={stage}
              />
            )
          })}
        </div>
      </div>
    </If>
  )
}
