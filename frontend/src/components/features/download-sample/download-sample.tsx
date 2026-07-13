import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Button } from 'antd'
import { LuFileDown } from 'react-icons/lu'

import useSampleCsv from './data/use-sample-csv'
import { type SampleFileName } from './shared/constants'

export default function DownloadSample({ fileName }: { fileName: SampleFileName }) {
  const { downloadUrl, isLoading } = useSampleCsv(fileName)

  return (
    <If conditions={downloadUrl && fileName}>
      <Button
        className="text-blue-500"
        disabled={isLoading}
        href={downloadUrl}
        icon={<LuFileDown size={14} />}
        loading={isLoading}
        type="link"
      >
        {__('Download Sample CSV')}
      </Button>
    </If>
  )
}
