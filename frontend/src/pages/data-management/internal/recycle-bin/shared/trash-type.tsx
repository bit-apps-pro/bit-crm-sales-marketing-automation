export type DeleteHandler = (ids: number[]) => void
export type RestoreHandler = (ids: number[]) => void

export interface Trash {
  created_at: string
  created_by: string
  created_by_name: string
  entity_id: string
  full_name: string
  id: number
  module: string
}

export interface TrashTableRow {
  created_at: string
  deleted_by: string
  id: number
  module: string
  name: string
}

export interface TrashesIndex {
  data: Trash[]
  total: number
}

export interface TrashesIndexPayload {
  dateRange?: string
  module?: string
  page?: number | string
  perPage?: number | string
  sortBy?: string
  sortOrder?: string
}

export interface TrashTableProps {
  isLoading: boolean
  onDelete: DeleteHandler
  onRestore: RestoreHandler
  trashes: Trash[]
}

export interface TrashBulkOperationsProps {
  onDelete: DeleteHandler
  onRestore: RestoreHandler
  selectedIds: number[]
}
