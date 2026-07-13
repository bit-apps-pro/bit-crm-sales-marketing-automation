import { __ } from '@common/helpers/i18nWrap'
import { Button } from 'antd'
import { LuPlus } from 'react-icons/lu'
import { Link } from 'react-router'

export default function InvoiceLogo({ logo }: { logo?: string }) {
  return (
    <div className="flex-1">
      {logo ? (
        <div className="">
          <img
            alt={__('Business Logo')}
            className="h-auto max-h-32 w-auto max-w-48 object-contain"
            src={logo}
          />
        </div>
      ) : (
        <Link target="_blank" to="/settings/general-settings">
          <Button
            className="flex flex-col px-8 py-16 text-base"
            icon={<LuPlus size={24} />}
            type="dashed"
          >
            {__('Add Logo')}
          </Button>
        </Link>
      )}
    </div>
  )
}
