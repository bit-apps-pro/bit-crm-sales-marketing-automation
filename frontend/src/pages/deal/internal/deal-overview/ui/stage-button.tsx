import { cn } from '@common/helpers/globalHelpers'
import { ARROW_WIDTH } from '@pages/deal/shared/constants'
import { type StageButtonProps } from '@pages/deal/shared/deal-types'
import { getClipPath } from '@pages/deal/shared/helpers'
import { useState } from 'react'

export default function StageButton({
  currentStageKey,
  disabled,
  isFirst,
  isLast,
  onClick,
  stage
}: StageButtonProps) {
  const [hoveredStage, setHoveredStage] = useState<string | undefined>()

  const isActive = stage.key === currentStageKey
  const isHovered = hoveredStage === stage.key
  const shouldBeColored = isActive || isHovered

  return (
    <div
      className="h-8 flex-1"
      key={stage.key}
      style={{
        marginLeft: isFirst ? '0' : `-${ARROW_WIDTH}px`
      }}
    >
      <button
        className={cn(
          'flex size-full cursor-pointer items-center justify-center rounded-sm border-0 text-sm font-medium transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800',
          disabled ? 'pointer-events-none' : ''
        )}
        onClick={() => onClick(stage.key)}
        onMouseEnter={() => setHoveredStage(stage.key)}
        onMouseLeave={() => setHoveredStage(undefined)}
        style={{
          backgroundColor: shouldBeColored ? stage.color : '',
          clipPath: getClipPath(isFirst, isLast),
          color: shouldBeColored ? '#ffffff' : ''
        }}
      >
        <span
          className="px-2 text-center"
          style={{ marginLeft: isFirst ? '0' : `${ARROW_WIDTH / 2}px` }}
        >
          {stage.name}
        </span>
      </button>
    </div>
  )
}
