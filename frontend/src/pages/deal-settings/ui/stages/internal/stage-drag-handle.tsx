import { HolderOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useContext } from 'react'

import RowContext from './stage-row-context'

export default function DragHandle() {
  const { listeners, setActivatorNodeRef } = useContext(RowContext)
  return (
    <Button
      icon={<HolderOutlined />}
      ref={setActivatorNodeRef}
      size="small"
      style={{ cursor: 'grab' }}
      type="text"
      {...listeners}
    />
  )
}
