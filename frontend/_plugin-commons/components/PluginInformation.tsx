import { __ } from '@common/helpers/i18nWrap'
import config from '@config/config'
import If from '@utilities/If'
import { Badge, Button, Space, Tag, Typography } from 'antd'
import Title from 'antd/es/typography/Title'
import { LuCheck, LuCrown } from 'react-icons/lu'
import { useAsync } from 'react-use'

import pluginInfo from './SupportPage/data/pluginInfoData'

const getCurrentBuildCodeName = (): string | undefined => {
  const scripts = [...document.scripts]

  for (const script of scripts) {
    if (script.src.includes('bit-pi') && script.src.includes('main')) {
      return script.src
        .split('/')
        .at(-1)
        ?.replace('main', '')
        .replace('.js', '')
        .split('-')
        .filter(Boolean)
        .join('-')
    }
  }
}

export default function PluginInformation({ pluginSlug }: { pluginSlug: string }) {
  const aboutPlugin = pluginInfo.plugins[pluginSlug as keyof typeof pluginInfo.plugins]
  const freeBuildCodeName = useAsync(async () => {
    const response = await fetch(`/wp-content/plugins/${config.PLUGIN_SLUG}/assets/build-code-name.txt`)

    return response.text()
  })
  const currentBuildCodeName = getCurrentBuildCodeName()

  return (
    <div className="mb-12">
      <Title level={5}>{__('Plugin Information')}</Title>

      <If conditions={currentBuildCodeName === '.tsx'}>
        <Tag className="mb-2 font-bold" color="blue">
          {__('Dev Version On')}
        </Tag>
      </If>

      <div className="mb-2">
        {__('Version')}: {config.FREE_VERSION}
        <If conditions={[!freeBuildCodeName.loading, !freeBuildCodeName.value?.includes('<html')]}>
          <Typography.Text className="ml-2 text-xs" type="secondary">
            {__('Code Name: ')}
            {freeBuildCodeName.value}
            <If conditions={freeBuildCodeName.value === currentBuildCodeName}>
              <LuCheck className="ml-1" />
            </If>
          </Typography.Text>
        </If>
      </div>

      <Space>
        <Badge dot>
          <Button
            href={aboutPlugin.buyLink}
            icon={<LuCrown />}
            rel="noopener noreferrer nofollow"
            target="_blank"
            type="primary"
          >
            {__('Buy Pro Version')}
          </Button>
        </Badge>
      </Space>
    </div>
  )
}
