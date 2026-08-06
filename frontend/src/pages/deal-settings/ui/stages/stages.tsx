import { __ } from '@common/helpers/i18nWrap'
import { type DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Button, Form, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { LuPlus } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import useStages from './data/use-stages'
import useUpdateSortOrder from './data/use-update-sort-order'
import StageCreateModal from './internal/stage-create-modal'
import StagesSortable from './internal/stages-sortable'
import StagesTable from './internal/stages-table'
import { type Stage } from './shared/types'
import useStageStore from './state/use-stage-store'

export default function Stages() {
  const [, setSearchParams] = useSearchParams()
  const [form] = Form.useForm()
  const { isStagesFetching, isStagesLoading, stages } = useStages()
  const [dataSource, setDataSource] = useState<Stage[]>([])
  const { updateSortOrder } = useUpdateSortOrder()
  const { handleModal } = useStageStore()

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setDataSource(prevState => {
        const activeIndex = prevState.findIndex(record => record.key === active?.id)
        const overIndex = prevState.findIndex(record => record.key === over?.id)
        const sortedItems = arrayMove(prevState, activeIndex, overIndex)
        setDataSource(sortedItems)
        updateSortOrder(sortedItems)

        return sortedItems
      })
    }
  }

  const handleCreateModalOpen = () => {
    handleModal('open', setSearchParams, { modal: 'stage_create' })
  }

  useEffect(() => {
    if (!isStagesFetching && !isStagesLoading) {
      setDataSource(stages)
    }
  }, [stages, isStagesFetching, isStagesLoading])

  return (
    <div>
      <div className="flex items-center gap-2 rounded-t-md border border-b-0 border-solid border-[#EBEAFF] bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900">
        <Typography.Title className="mb-0" level={4}>
          {__('Stages')}
        </Typography.Title>
        <Button
          className="rounded-full shadow-none"
          icon={<LuPlus />}
          onClick={handleCreateModalOpen}
          type="primary"
        >
          {__('New Stage')}
        </Button>
      </div>

      <Form component={false} form={form}>
        <StagesSortable dataSource={dataSource} onDragEnd={onDragEnd}>
          <StagesTable data={dataSource} form={form} />
        </StagesSortable>
      </Form>
      <StageCreateModal />
    </div>
  )
}
