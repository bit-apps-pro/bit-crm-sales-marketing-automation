import config from '@config/config'
import SupportPage from '@plugin-commons/components/SupportPage'

export default function Support() {
  return (
    <SupportPage isCashBackVisible={false} logoComponent={undefined} pluginSlug={config.PLUGIN_SLUG} />
  )
}
