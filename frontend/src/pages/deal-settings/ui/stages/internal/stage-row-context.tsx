import { type SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { createContext } from 'react'

export interface StageRowContextProps {
  listeners?: SyntheticListenerMap
  setActivatorNodeRef?: (element: HTMLElement | null) => void
}

export const StageRowContext = createContext<StageRowContextProps>({})

export default StageRowContext
