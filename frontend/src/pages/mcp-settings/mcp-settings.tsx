import { __ } from '@common/helpers/i18nWrap'
import { ProMcpSettingsAlert } from '@utilities/pro-feature-alert'

export default function McpSettings() {
  return <ProMcpSettingsAlert featureName={__('MCP Server')} />
}
