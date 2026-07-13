import { type ImapDataType } from '../shared/imap-type'
import ImapItem from './imap-item'

export default function ImapList({ imaps }: { imaps: ImapDataType[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {imaps?.map(imap => (
        <ImapItem imap={imap} key={imap.id} />
      ))}
    </div>
  )
}
