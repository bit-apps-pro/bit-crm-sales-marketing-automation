import { List, Skeleton } from 'antd'

interface NotesSkeletonProps {
  quantity?: number
}

export default function NotesSkeleton({ quantity = 1 }: NotesSkeletonProps) {
  return (
    <List
      dataSource={Array.from({ length: quantity }, (_, i) => i)}
      renderItem={() => (
        <List.Item className="mb-2 rounded bg-slate-50 p-3 dark:bg-slate-800">
          <Skeleton
            active
            avatar={false}
            paragraph={{ rows: 2, width: ['100%', '60%'] }}
            title={{ width: '30%' }}
          />
        </List.Item>
      )}
    />
  )
}
