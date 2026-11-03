import { __ } from '@common/helpers/i18nWrap'
import { Button } from 'antd'
import { useState } from 'react'
import { LuLink } from 'react-icons/lu'

import useInvoiceShareLink from '../data/use-invoice-share-link'
import { buildInvoiceShareTargets } from '../shared/invoice-share-targets'
import ShareLinkModal from './share-link-modal'

export default function InvoiceShareLinkButton({ invoiceId }: { invoiceId: number }) {
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
      <ShareLinkModal
        description={__('Anyone with this link can view and pay this invoice without logging in.')}
        onClose={handleClose}
        open={isModalOpen}
        shareTargets={buildInvoiceShareTargets(shareUrl ?? '')}
        shareUrl={shareUrl}
        title={__('Share invoice')}
      />
    </>
  )
}
