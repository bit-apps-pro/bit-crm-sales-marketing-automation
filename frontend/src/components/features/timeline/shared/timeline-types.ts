export interface TimelineItemType {
  created_at: string
  created_by: number
  details: string
  entity_id: number
  event: string
  id: number
  module: string
  title: string
}

export interface TimelinesPayloadType {
  entity_id: number
  module: string
}

export interface TimelinePropsType {
  entityId: number
  module: string
}
