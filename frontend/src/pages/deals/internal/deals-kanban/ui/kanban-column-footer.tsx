import { __ } from '@common/helpers/i18nWrap'
import { Button } from 'antd'
import { useCallback } from 'react'
import { LuPlus } from 'react-icons/lu'
import { useNavigate } from 'react-router'

export default function KanbanColumnFooter({ stageKey }: { stageKey: string }) {
  const navigate = useNavigate()

  const handleAddNewDeal = useCallback(() => {
    navigate(`/deals/create?stage=${stageKey}`)
  }, [stageKey, navigate])

  return (
    <div className="absolute -bottom-20 left-0 w-full bg-white p-2 opacity-0 transition-all duration-300 group-hover/column:bottom-0 group-hover/column:opacity-100 dark:border-slate-700 dark:bg-slate-700">
      <Button
        className="w-full"
        icon={<LuPlus size={12} />}
        onClick={handleAddNewDeal}
        size="small"
        type="dashed"
      >
        {__('Add New')}
      </Button>
    </div>
  )
}
