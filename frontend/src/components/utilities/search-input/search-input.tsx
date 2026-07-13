import { __ } from '@common/helpers/i18nWrap'
import { type InputProps } from 'antd'
import { Input } from 'antd'
import { LuSearch } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

interface SearchInputProps extends InputProps {
  queryKey?: string
}

export default function SearchInput({ queryKey = 'searchTerm', ...props }: SearchInputProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchTerm = searchParams.get(queryKey) || ''

  const handleSearchChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setSearchParams(prev => {
      if (prev.has('page')) {
        prev.set('page', '1')
      }
      if (!e.target.value) {
        prev.delete(queryKey)
        return prev
      }
      prev.set(queryKey, e.target.value)
      return prev
    })
  }

  return (
    <Input
      allowClear
      className="w-52 rounded-full"
      name="search"
      onChange={handleSearchChange}
      placeholder={__('Search by keyword')}
      prefix={<LuSearch name="search" size={14} />}
      type="search"
      value={searchTerm}
      {...props}
    />
  )
}
