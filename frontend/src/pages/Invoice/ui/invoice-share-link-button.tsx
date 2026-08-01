import { __ } from '@common/helpers/i18nWrap'
import useCopyToClipboard from '@common/hooks/useCopyToClipboard'
import { Button, Input, Modal, Space, Tooltip } from 'antd'
import { useState } from 'react'
import { LuCheck, LuCopy, LuLink } from 'react-icons/lu'

import useInvoiceShareLink from '../data/use-invoice-share-link'
import { buildInvoiceShareTargets } from '../shared/invoice-share-targets'

export default function InvoiceShareLinkButton({ invoiceId }: { invoiceId: number }) {
  const { copied, copy } = useCopyToClipboard()
  const { generateShareLink, isShareLinkPending, resetShareLink, shareUrl } = useInvoiceShareLink()
  const [isModalOpen, setModalOpen] = useState(false)

  const handleShare = () => {
    generateShareLink(
      { id: invoiceId },
      { onSuccess: response => response.data?.url && setModalOpen(true) }
    )
  }

  const handleClose = () => {
    setModalOpen(false)
    resetShareLink()
  }

  const socialTargets = buildInvoiceShareTargets(shareUrl ?? '')

  return (
    <>
      <Button
        className="rounded-full"
        icon={<LuLink />}
        loading={isShareLinkPending}
        onClick={handleShare}
        size="middle"
      >
        {__('Share Link')}
      </Button>
      <Modal footer={false} onCancel={handleClose} open={isModalOpen} title={__('Share invoice')}>
        <p className="text-slate-500">
          {__('Anyone with this link can view and pay this invoice without logging in.')}
        </p>
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
            {socialTargets.map(target => (
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
    </>
  )
}
