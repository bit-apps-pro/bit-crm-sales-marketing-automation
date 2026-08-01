import PAGINATION from '@common/constants/pagination'
import { __ } from '@common/helpers/i18nWrap'
import Pagination from '@utilities/pagination/pagination'
import { Alert, Button, Space, Switch, Typography } from 'antd'
import { useState } from 'react'
import { LuExternalLink, LuPlus } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import useApiSettings from './data/use-api-settings'
import useUpdateApiSettings from './data/use-update-api-settings'
import ApiKeyCreateModal from './ui/api-key-create-modal'
import ApiKeyTable from './ui/api-key-table'

export default function ApiSettings() {
  const [searchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const perPage = Number(searchParams.get('perPage')) || PAGINATION.DEFAULT_PER_PAGE

  const { apiSettings, isFetchingApiSettings, isPendingApiSettings, total, users } = useApiSettings({
    page,
    perPage
  })
  const { isUpdatingApiSettings, updateApiSettings } = useUpdateApiSettings()
  const [isCreateModalOpen, setCreateModalOpen] = useState(false)

  return (
    <div>
      <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-neutral-700">
        <Typography.Title className="mb-0" level={2}>
          {__('REST API')}
        </Typography.Title>
      </div>

      <div className="mx-6 my-2">
        <Space className="w-full" direction="vertical" size="large">
          {apiSettings?.available === false && (
            <Alert
              description={__(
                'Application Passwords require HTTPS, or a local environment type. Keys cannot be used until that is resolved.'
              )}
              message={__('Application Passwords are unavailable on this site')}
              showIcon
              type="warning"
            />
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <Typography.Text className="text-base" strong>
                {__('External API access')}
              </Typography.Text>
              <Typography.Text type="secondary">
                {__('Allow external apps to access the CRM using an API key.')}
              </Typography.Text>
            </div>
            <Switch
              checked={apiSettings?.enabled ?? false}
              loading={isUpdatingApiSettings || isPendingApiSettings}
              onChange={enabled => updateApiSettings({ enabled })}
            />
          </div>

          {apiSettings?.baseUrl && (
            <div className="flex items-center justify-between gap-4">
              <Space direction="vertical" size={0}>
                <Typography.Text strong>{__('Base URL')}</Typography.Text>
                <Typography.Text code copyable>
                  {apiSettings.baseUrl}
                </Typography.Text>
              </Space>
              {/* TODO: point href at the published API documentation once it exists. */}
              <Button icon={<LuExternalLink size={14} />} iconPosition="end" type="link">
                {__('API documentation')}
              </Button>
            </div>
          )}

          <div className="rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
            <div className="flex items-center justify-between gap-4 p-3">
              <div className="flex flex-col">
                <Typography.Text className="text-base" strong>
                  {__('Manage the API keys used to reach this site from outside WordPress.')}
                </Typography.Text>
                <Typography.Text type="secondary">
                  {__('Expand a user to see the keys they hold. A user may hold more than one.')}
                </Typography.Text>
              </div>
              <Button
                className="rounded-full"
                icon={<LuPlus />}
                onClick={() => setCreateModalOpen(true)}
                size="large"
                type="primary"
              >
                {__('Create API Key')}
              </Button>
            </div>

            <ApiKeyTable
              isFetchingApiKeys={isFetchingApiSettings}
              isPendingApiKeys={isPendingApiSettings}
              users={users}
            />

            <div className="flex justify-center py-5">
              <Pagination showSizeChanger={false} total={total || 0} />
            </div>
          </div>
        </Space>
      </div>

      <ApiKeyCreateModal onClose={() => setCreateModalOpen(false)} open={isCreateModalOpen} />
    </div>
  )
}
