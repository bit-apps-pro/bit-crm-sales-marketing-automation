import { type ImapDataType } from '../shared/imap-type'
import ImapItem from './imap-item'

export default function ImapList({ imaps }: { imaps: ImapDataType[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {imaps?.map(imap => (
        <ImapItem imap={imap} key={imap.id} />
      ))}
    </div>
  )
}
