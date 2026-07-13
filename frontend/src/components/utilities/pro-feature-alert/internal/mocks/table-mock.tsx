import { Pagination, Table } from 'antd'

export default function TableMock({ columns }: { columns: string[] }) {
  const tableColumns = columns.map(label => ({ key: label, title: label, width: 180 }))

  return (
    <div>
      <Table
        columns={tableColumns}
        dataSource={[]}
        pagination={false}
        scroll={{ x: 'max-content' }}
        size="small"
      />
      <div className="flex justify-center py-5">
        <Pagination defaultCurrent={1} pageSize={10} total={50} />
      </div>
    </div>
  )
}
