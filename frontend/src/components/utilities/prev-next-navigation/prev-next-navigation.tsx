import { MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import { Button } from 'antd'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'

const MODULES_PLURAL_MAP = {
  [MODULES.COMPANY]: 'companies',
  [MODULES.CONTACT]: 'contacts',
  [MODULES.DEAL]: 'deals',
  [MODULES.LEAD]: 'leads',
  [MODULES.PRODUCT]: 'products'
}

export default function PrevNextNavigation({
  module,
  nextId,
  previousId
}: {
  module: keyof typeof MODULES_PLURAL_MAP
  nextId?: null | number
  previousId?: null | number
}) {
  return (
    <div className="flex items-center">
      <Link to={`../${MODULES_PLURAL_MAP[module]}/details/${nextId}`}>
        <Button
          className="flex items-center gap-0 px-2"
          disabled={Boolean(!nextId)}
          title={__('previous record')}
          type="link"
        >
          <ChevronLeft size={20} />
          {__('Prev')}
        </Button>
      </Link>
      <Link to={`../${MODULES_PLURAL_MAP[module]}/details/${previousId}`}>
        <Button
          className="flex items-center gap-0 px-2"
          disabled={Boolean(!previousId)}
          title={__('next record')}
          type="link"
        >
          {__('Next')}
          <ChevronRight size={20} />
        </Button>
      </Link>
    </div>
  )
}
