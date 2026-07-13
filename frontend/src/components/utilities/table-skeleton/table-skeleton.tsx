import { Skeleton } from 'antd'

const TableSkeleton = ({ column, row }: { column: number; row: number }) => {
  return (
    <div className="w-full space-y-3 py-1">
      {Array.from({ length: row }, (_, rowIndex) => (
        <div className="flex w-full gap-4" key={rowIndex}>
          {Array.from({ length: column }, (_, colIndex) => (
            <div className="flex-1" key={colIndex}>
              <Skeleton.Input active className="w-full" size="large" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default TableSkeleton
