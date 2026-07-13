import { AutoComplete } from 'antd'
import { useState } from 'react'
import { LuLoader } from 'react-icons/lu'
import { useDebounce } from 'react-use'

import { type LookupOption } from './data/use-lookup-options'
import useLookupOptions from './data/use-lookup-options'

interface LookupFieldProps {
  className?: string
  disabled?: boolean
  onChange?: (value: LookupOption | number | string) => void
  relatedModule: string
  value?: string
}

export default function LookupField({
  className,
  disabled = false,
  onChange,
  relatedModule,
  value
}: LookupFieldProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [displayValue, setDisplayValue] = useState<string>(value || '')

  const { isFetching, options } = useLookupOptions({
    relatedModule: relatedModule,
    searchTerm: debouncedSearchTerm
  })

  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm)
    },
    300,
    [searchTerm]
  )

  const handleSearch = (searchValue: string) => {
    if (searchValue === searchTerm) return

    setSearchTerm(searchValue)
  }

  const handleSelect = (_value: string, option: LookupOption) => {
    setDisplayValue(option.label)
    onChange?.(option.label)
  }

  const handleChange = (value: string) => {
    setDisplayValue(value)
    onChange?.(value)

    if (!value) {
      setSearchTerm('')
    }
  }

  return (
    <AutoComplete
      className={className}
      disabled={disabled}
      notFoundContent={
        isFetching ? (
          <div className="flex animate-spin items-center justify-center">
            <LuLoader size={16} />
          </div>
        ) : undefined
      }
      onChange={handleChange}
      onSearch={handleSearch}
      onSelect={handleSelect}
      options={options as LookupOption[]}
      value={displayValue}
    />
  )
}
