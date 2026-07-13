import { LoadingOutlined } from '@ant-design/icons'
import { getFilteredModuleOptions, MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import ModuleSelect from '@utilities/module-select'
import Pagination from '@utilities/pagination'
import { Typography } from 'antd'
import { useSearchParams } from 'react-router'

import { useImportsData } from './data/use-imports-data'
import ImportsTable from './ui/imports-table'

const FILTERED_MODULE_OPTIONS = getFilteredModuleOptions([MODULES.INVOICE])

export default function Imports() {
  const [searchParams, setSearchParams] = useSearchParams()
  const module = searchParams.get('module') || ''
  const page = Number(searchParams.get('page') || 1)
  const perPage = Number(searchParams.get('perPage') || 10)

  const { importsData, isImportsDataFetching, isImportsDataPending, totalImportsData } = useImportsData({
    module,
    page,
    perPage
  })

  const handleModuleChange = (module: string) => {
    setSearchParams(prev => {
      prev.set('page', '1')
      if (!module) {
        prev.delete('module')
        return prev
      }
      prev.set('module', module)
      return prev
    })
  }

  return (
    <div className="rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="flex items-center gap-2">
          <Typography.Title className="mb-0" level={4}>
            {__('Imports history')}
          </Typography.Title>
          <If conditions={isImportsDataPending}>
            <LoadingOutlined />
          </If>
        </div>
        <ModuleSelect
          allowClear
          className="w-36 [&_.ant-select-selector]:rounded-full"
          onChange={handleModuleChange}
          options={FILTERED_MODULE_OPTIONS}
          placeholder={__('Filter by module')}
          popupMatchSelectWidth
          value={module || undefined}
        />
      </div>
      <ImportsTable importsData={importsData} loading={isImportsDataFetching || isImportsDataPending} />
      <div className="flex justify-center p-2">
        <Pagination total={totalImportsData} />
      </div>
    </div>
  )
}
