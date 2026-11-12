import { __ } from '@common/helpers/i18nWrap'
import { Badge, Button, Switch, Typography } from 'antd'

import { type ProFeatureAlertProps } from '../../shared/type'
import LockedOverlay from '../locked-overlay'

const { Paragraph, Text, Title } = Typography

const CALENDARS = [
  { description: __('Gmail or Google Workspace account.'), name: __('Google Calendar') },
  {
    description: __('Microsoft 365, work, school or Outlook.com account.'),
    name: __('Outlook Calendar')
  },
  { description: __('Zoho account, in any Zoho data center.'), name: __('Zoho Calendar') },
  { description: __('iCloud account, on your iPhone and Mac.'), name: __('Apple iCloud Calendar') }
]

export default function ProCalendarIntegrationAlert({ featureName }: ProFeatureAlertProps) {
  return (
    <LockedOverlay featureName={featureName}>
      <div>
        <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-neutral-700">
          <Title className="mb-0" level={2}>
            {__('Calendar Integration')}
          </Title>
        </div>

        <div className="p-5">
          <Paragraph className="max-w-3xl" type="secondary">
            {__(
              'Meetings and calls assigned to you appear in your own calendar, with a reminder 30 minutes before. Each team member sets up their own.'
            )}
          </Paragraph>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {CALENDARS.map(({ description, name }) => (
              <div
                className="flex flex-col rounded-lg border border-solid border-[#E5E3FE] dark:border-neutral-700"
                key={name}
              >
                <div className="flex flex-1 items-start gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <Text className="block text-base font-medium">{name}</Text>
                    <Text className="block text-sm" type="secondary">
                      {description}
                    </Text>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center gap-2 border-0 border-t border-solid border-[#E5E3FE] px-4 py-2.5 dark:border-neutral-700">
                  <Badge
                    className="flex-1"
                    status="default"
                    text={<Text className="text-sm">{__('Not connected')}</Text>}
                  />
                  <Button>{__('Connect')}</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LockedOverlay>
  )
}
