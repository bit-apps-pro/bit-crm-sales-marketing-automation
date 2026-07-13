import { __ } from '@common/helpers/i18nWrap'
import { Skeleton, Typography } from 'antd'

const skeletonRows = Array.from({ length: 12 }, (_, index) => index)

export default function ConversionMappingSkeleton() {
  return (
    <div className="space-y-2 rounded-lg">
      <Typography.Title className="mb-0" level={4}>
        {__('Field mapping')}
      </Typography.Title>
      <div className="space-y-2">
        <div className="mt-4 overflow-hidden rounded-md border border-gray-300 dark:border-gray-600">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="border-b border-r border-gray-300 px-2 py-2 text-left text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200">
                  {__('Lead')}
                </th>
                <th className="border-b border-r border-gray-300 px-2 py-2 text-left text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200">
                  {__('Contact')}
                </th>
                <th className="border-b border-r border-gray-300 px-2 py-2 text-left text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200">
                  {__('Company')}
                </th>
                <th className="border-b border-r border-gray-300 px-2 py-2 text-left text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-200">
                  {__('Deal')}
                </th>
              </tr>
            </thead>
            <tbody>
              {skeletonRows.map(index => (
                <tr
                  className="dark:hover:bg-gray-750 bg-white hover:bg-gray-50 dark:bg-gray-800"
                  key={`skeleton-${index}`}
                >
                  <td className="border-b border-r border-gray-300 p-2 dark:border-gray-600">
                    <Skeleton.Input active block style={{ height: 34 }} />
                  </td>
                  <td className="border-b border-r border-gray-300 p-2 dark:border-gray-600">
                    <Skeleton.Input active block style={{ height: 34 }} />
                  </td>
                  <td className="border-b border-gray-300 p-2 dark:border-gray-600">
                    <Skeleton.Input active block style={{ height: 34 }} />
                  </td>
                  <td className="border-b border-gray-300 p-2 dark:border-gray-600">
                    <Skeleton.Input active block style={{ height: 34 }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Skeleton.Button active style={{ height: 32, width: 80 }} />
      </div>
    </div>
  )
}
