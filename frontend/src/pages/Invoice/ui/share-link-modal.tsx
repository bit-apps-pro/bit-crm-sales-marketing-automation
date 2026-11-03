import { __ } from '@common/helpers/i18nWrap'
import useCopyToClipboard from '@common/hooks/useCopyToClipboard'
import { Button, Input, Modal, Space, Tooltip } from 'antd'
import { LuCheck, LuCopy } from 'react-icons/lu'

import { type InvoiceShareTarget } from '../shared/invoice-share-targets'

interface ShareLinkModalProps {
  description: string
  onClose: () => void
  open: boolean
  shareTargets: InvoiceShareTarget[]
  shareUrl?: string
  title: string
}

/** The share-link dialog: copyable link plus one-click share targets. Used by invoices and pro quotes. */
export default function ShareLinkModal({
  description,
  onClose,
  open,
  shareTargets,
  shareUrl,
  title
}: ShareLinkModalProps) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <Modal footer={false} onCancel={onClose} open={open} title={title}>
      <p className="text-slate-500">{description}</p>
      <Space.Compact block>
        <Input className="min-h-8 py-1" readOnly value={shareUrl} />
        <Button
          icon={copied ? <LuCheck /> : <LuCopy />}
          onClick={() => shareUrl && copy(shareUrl)}
          type="primary"
        >
          {copied ? __('Copied') : __('Copy')}
        </Button>
      </Space.Compact>
      <div className="mt-4">
        <p className="mb-2 text-slate-500">{__('Or send it directly via')}</p>
        <div className="flex flex-wrap gap-3">
          {shareTargets.map(target => (
            <Tooltip key={target.label} title={target.label}>
              <a
                aria-label={target.label}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-opacity hover:opacity-85"
                href={shareUrl ? target.url : undefined}
                rel="noopener noreferrer"
                style={{ backgroundColor: target.color }}
                target="_blank"
              >
                <target.icon size={18} />
              </a>
            </Tooltip>
          ))}
        </div>
      </div>
    </Modal>
  )
}
