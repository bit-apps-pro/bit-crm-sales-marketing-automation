import { MODULES, MODULES_PLURAL } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import { LuExternalLink } from 'react-icons/lu'
import { Link } from 'react-router'

const NAVIGABLE_MODULES = new Set([
  MODULES.COMPANY,
  MODULES.CONTACT,
  MODULES.DEAL,
  MODULES.LEAD,
  MODULES.PRODUCT
])

interface LookupFieldNavigationProps {
  id?: number | string
  relatedModule: string
}

export default function LookupFieldNavigation({ id, relatedModule }: LookupFieldNavigationProps) {
  if (!id || !NAVIGABLE_MODULES.has(relatedModule)) {
    // eslint-disable-next-line unicorn/no-null
    return null
  }

  return (
    <Link
      className="absolute -bottom-6 right-0 flex items-center justify-start gap-1 text-primary"
      target="_blank"
      to={`/${MODULES_PLURAL[relatedModule]}/details/${id}`}
    >
      {__('View details')}
      <LuExternalLink size={14} />
    </Link>
  )
}
