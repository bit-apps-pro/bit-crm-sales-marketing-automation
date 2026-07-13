import { LoadingOutlined } from '@ant-design/icons'

import {
  useDealInformationSelect,
  useInvoiceBottomSectionNotesSelect
} from '../state/use-invoice-create-store'
import Section from './section'

interface BottomSectionProps {
  mode: 'create' | 'edit'
}
export default function BottomSection({ mode }: BottomSectionProps) {
  const bottomSections = useInvoiceBottomSectionNotesSelect()
  const dealInformation = useDealInformationSelect()
  if (mode === 'edit' && dealInformation?.isDealSelected === false) {
    return <LoadingOutlined />
  }
  return (
    <div className="space-y-5">
      {bottomSections.map((section, index) => (
        <Section key={index} position="bottom" {...section} index={index} />
      ))}
    </div>
  )
}
