import { __ } from '@common/helpers/i18nWrap'
import { type PluginSlug } from '@features/plugin-activation-guard/shared/constants'
import bitFlowsLogo from '@resource/img/Bit-Flows-Main-logo.svg'
import bitIntegrationsLogo from '@resource/img/Bit-Integrations-Main-logo.svg'

export interface PluginCard {
  description: string
  logo: string
  slug: PluginSlug
  title: string
}

export const PLUGIN_CARDS: PluginCard[] = [
  {
    description: __(
      'Build automated workflows visually and connect Bit CRM events to the apps your team already uses.'
    ),
    logo: bitFlowsLogo,
    slug: 'bit-pi',
    title: __('Bit Flows')
  },
  {
    description: __(
      'Connect your favorite apps and automate repetitive workflows with 300+ popular integrations.'
    ),
    logo: bitIntegrationsLogo,
    slug: 'bit-integrations',
    title: __('Bit Integration')
  }
]
