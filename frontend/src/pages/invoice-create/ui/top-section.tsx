import { LoadingOutlined } from '@ant-design/icons'

import {
  useDealInformationSelect,
  useInvoiceTopSectionNotesSelect
} from '../state/use-invoice-create-store'
import Section from './section'

interface TopSectionProps {
  mode: 'create' | 'edit'
}

export default function TopSection({ mode }: TopSectionProps) {
  const topSections = useInvoiceTopSectionNotesSelect()
  const dealInformation = useDealInformationSelect()
  if (mode === 'edit' && dealInformation?.isDealSelected === false) {
    return <LoadingOutlined />
  }
  return (
    <div>
      {topSections.map((section, index) => (
        <Section key={index} position="top" {...section} index={index} />
      ))}
    </div>
  )
}
