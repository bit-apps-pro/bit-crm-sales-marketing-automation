import { __ } from '@common/helpers/i18nWrap'

export default function DealFieldOverrideNote() {
  return (
    <div className="rounded-lg bg-gray-100 p-4 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">
      <h4 className="font-semibold">{__('Notes:')}</h4>
      <ul className="ml-4 mt-2 list-disc space-y-1">
        <li>{__('Deals will be created with the first active stage')}</li>
        <li>{__('If the selected stage is not present, the first active stage will be assigned.')}</li>
        <li>
          {__(
            'For fields that are not selected here, the value will be applied based on lead conversion mapping.'
          )}
        </li>
      </ul>
    </div>
  )
}
