import { __ } from '@common/helpers/i18nWrap'
import If from '@components/utilities/If'
import { Button, Typography } from 'antd'
import { LuMail, LuPhone } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import { type EntitySummaryData } from './entity-summary-card'

export default function EntitySummaryInfo({ entity }: { entity: EntitySummaryData }) {
  const { email, name, phone, price, sku, status } = entity
  const [, setSearchParams] = useSearchParams()

  const handleEmailClick = () => {
    if (email) {
      setSearchParams({ tab: 'email' })
    }
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="mb-2 flex items-center gap-2">
        <Typography.Title className="mb-0" level={4}>
          {name}
        </Typography.Title>
        <If conditions={status}>{status}</If>
      </div>

      <If conditions={email !== undefined}>
        <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-neutral-400">
          <LuMail className="shrink-0" />
          <If conditions={email}>
            <Button className="p-0 hover:text-blue-500" onClick={handleEmailClick} type="link">
              {email}
            </Button>
          </If>
          <If conditions={!email}>
            <p className="mb-0 text-sm text-slate-400 dark:text-neutral-500">{__('Not set')}</p>
          </If>
        </span>
      </If>

      <If conditions={phone !== undefined}>
        <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-neutral-400">
          <LuPhone className="shrink-0" />
          <If conditions={phone}>
            <Button className="p-0 hover:text-blue-500" href={`tel:${phone}`} type="link">
              {phone}
            </Button>
          </If>
          <If conditions={!phone}>
            <p className="mb-0 text-sm text-slate-400 dark:text-neutral-500">{__('Not set')}</p>
          </If>
        </span>
      </If>

      <If conditions={sku !== undefined}>
        <div className="mt-1 flex items-center gap-2 text-sm text-slate-700 dark:text-neutral-300">
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-xs font-medium tracking-wide text-slate-500 dark:bg-neutral-800 dark:text-neutral-400">
            {__('SKU')}
          </span>
          <If conditions={sku}>
            <p className="mb-0 text-sm font-medium text-slate-700 dark:text-neutral-200">{sku}</p>
          </If>
          <If conditions={!sku}>
            <p className="mb-0 text-sm text-slate-400 dark:text-neutral-500">{__('Not set')}</p>
          </If>
        </div>
      </If>

      <If conditions={price !== undefined}>
        <div className="mt-1 flex items-center gap-2 text-sm text-slate-700 dark:text-neutral-300">
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-xs font-medium tracking-wide text-slate-500 dark:bg-neutral-800 dark:text-neutral-400">
            {__('Price')}
          </span>
          <If conditions={price !== null}>
            <p className="mb-0 text-sm font-medium text-slate-700 dark:text-neutral-200">{price}</p>
          </If>
          <If conditions={price === null}>
            <p className="mb-0 text-sm text-slate-400 dark:text-neutral-500">{__('Not set')}</p>
          </If>
        </div>
      </If>
    </div>
  )
}
