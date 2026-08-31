import { getAdjacentId } from '@common/helpers/list-selection'
import useSelectedIdSync from '@common/hooks/use-selected-id-sync'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

import { type ActivityType, type ActivityTypeValue } from '../shared/activity-types'
import useActivity from './use-activity'

interface UseActivitySelectionParams {
  activities?: ActivityType[]
  activityType: ActivityTypeValue
  isLoading: boolean
}

/**
 * Resolves the selected activity from `?id=`, keeps that param in step with the
 * loaded list (first item by default, follow the list after filter changes) and
 * works out which neighbour to select once the current one is deleted.
 */
export default function useActivitySelection({
  activities,
  activityType,
  isLoading
}: UseActivitySelectionParams) {
  const [searchParams] = useSearchParams()
  const id = Number(searchParams.get('id')) || 0
  const ids = useMemo(() => activities?.map(activity => Number(activity.id)), [activities])

  const { activity, isError, isLoading: isLoadingActivity, isPlaceholderData } = useActivity(id)
  const isTypeMismatch = Boolean(activity) && activity?.type !== activityType
  const isValidSelection = Boolean(activity) && !isTypeMismatch

  useSelectedIdSync({ ids, isInvalid: isError || isTypeMismatch, isLoading })

  return {
    activity,
    adjacentId: ids ? getAdjacentId(ids, id) : undefined,
    id,
    isLoadingActivity,
    isPlaceholderData,
    isValidSelection
  }
}
