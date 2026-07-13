import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React, { useMemo } from 'react'

import StageRowContext, { type StageRowContextProps } from './stage-row-context'

export interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string
}

export default function Row(props: RowProps) {
  const { attributes, isDragging, listeners, setActivatorNodeRef, setNodeRef, transform, transition } =
    useSortable({ id: props['data-row-key'] })

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {})
  }

  const contextValue = useMemo<StageRowContextProps>(
    () => ({ listeners, setActivatorNodeRef }),
    [setActivatorNodeRef, listeners]
  )

  return (
    <StageRowContext.Provider value={contextValue}>
      <tr {...props} ref={setNodeRef} style={style} {...attributes} />
    </StageRowContext.Provider>
  )
}
