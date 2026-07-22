import { formatDateTime } from '@common/helpers/globalHelpers'
import { Timeline as AntTimeline, Empty, Typography } from 'antd'
import { LucideEdit } from 'lucide-react'
import { LuClock, LuInfo, LuPlus, LuTrash2 } from 'react-icons/lu'

import useTimelines from './data/use-timelines'
import { type TimelinePropsType } from './shared/timeline-types'

function RenderIconByEvent({ event }: { event: string }) {
  switch (event) {
    case 'created': {
      return <LuPlus className="text-green-500" size={14} />
    }
    case 'deleted': {
      return <LuTrash2 className="text-red-500" size={14} />
    }
    case 'info': {
      return <LuInfo className="text-gray-500" size={14} />
    }
    case 'updated': {
      return <LucideEdit className="text-blue-500" size={14} />
    }
    default: {
      return <LuClock className="text-gray-400" size={14} />
    }
  }
}

export default function Timeline({ entityId, module }: TimelinePropsType) {
  const { timelines } = useTimelines({ entity_id: entityId, module })

  if (!timelines?.length) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  const items = timelines.map(timeline => ({
    children: (
      <>
        <div className="flex items-center justify-between gap-3">
          <Typography.Title className="mb-0 capitalize" level={5}>
            {timeline?.title}
          </Typography.Title>
          <Typography.Paragraph className="mb-0 text-xs text-slate-400">
            {formatDateTime(timeline?.created_at)}
          </Typography.Paragraph>
        </div>
        <Typography.Paragraph className="mb-1 text-slate-500">{timeline?.details}</Typography.Paragraph>
      </>
    ),
    dot: (
      <div className="flex items-center justify-center rounded bg-white p-1 shadow-sm dark:bg-slate-800">
        <RenderIconByEvent event={timeline?.event} />
      </div>
    ),
    key: timeline.id
  }))

  return (
    <div
      className="scroller thin max-h-72 overflow-y-auto p-2"
      style={{
        marginInline: '-10px',
        overflowY: 'auto',
        paddingInline: '10px'
      }}
    >
      <AntTimeline items={items} />
    </div>
  )
}
