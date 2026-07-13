import { MODULE_OPTIONS } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import ModuleSelect from '@utilities/module-select'
import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router'

interface ModuleFilterProps {
  excludeModules?: string[]
}

export default function ModuleFilter({ excludeModules = [] }: ModuleFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const moduleParam = searchParams.get('modules')

  const urlModules = useMemo(
    () => (moduleParam ? moduleParam.split(',').filter(Boolean) : []),
    [moduleParam]
  )

  const selectedModules = useMemo(
    () => urlModules.filter(m => !excludeModules.includes(m)),
    [urlModules, excludeModules]
  )

  useEffect(() => {
    if (urlModules.length === selectedModules.length) return
    setSearchParams(
      prev => {
        if (selectedModules.length === 0) {
          prev.delete('modules')
        } else {
          prev.set('modules', selectedModules.join(','))
        }
        return prev
      },
      { replace: true }
    )
  }, [urlModules, selectedModules, setSearchParams])

  const filteredOptions = useMemo(
    () => MODULE_OPTIONS.filter(opt => !excludeModules.includes(opt.value)),
    [excludeModules]
  )

  const handleFilterChange = (moduleIds: string[]) => {
    setSearchParams(prev => {
      if (moduleIds.length === 0) {
        prev.delete('modules')
      } else {
        prev.set('modules', moduleIds.join(','))
      }
      return prev
    })
  }

  return (
    <ModuleSelect
      allowClear
      className="min-w-52 [&_.ant-select-selection-item]:rounded-full [&_.ant-select-selector]:rounded-full"
      filterOption={(input, option) =>
        String(option?.label ?? '')
          .toLowerCase()
          .includes(input.toLowerCase())
      }
      maxTagCount="responsive"
      mode="multiple"
      onChange={handleFilterChange}
      options={filteredOptions}
      placeholder={__('Filter With Modules')}
      showSearch
      value={selectedModules}
    />
  )
}
