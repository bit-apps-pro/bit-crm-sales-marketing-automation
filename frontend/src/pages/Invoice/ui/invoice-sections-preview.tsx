import { type SectionType } from '@pages/invoice-create/shared/invoice-create-types'
import { Typography } from 'antd'
import DOMPurify from 'dompurify'

interface InvoiceSectionsPreviewProps {
  sectionNotes: SectionType[]
}
export default function InvoiceSectionsPreview({ sectionNotes }: InvoiceSectionsPreviewProps) {
  return (
    <div>
      {sectionNotes.map(
        (sectionNote, index: number) =>
          sectionNote.value.length !== 0 && (
            <div key={index}>
              <Typography.Title level={5}>{sectionNote.label}</Typography.Title>
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(sectionNote.value) }} />
            </div>
          )
      )}
    </div>
  )
}
