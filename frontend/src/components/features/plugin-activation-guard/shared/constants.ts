import { __ } from '@common/helpers/i18nWrap'
import bitFlowsLogo from '@resource/img/Bit-Flows-Main-logo.svg'
import bitFormLogo from '@resource/img/Bit-Form-Main-logo.svg'
import bitIntegrationsLogo from '@resource/img/Bit-Integrations-Main-logo.svg'
import bitSmtpLogo from '@resource/img/Bit-SMTP-Main-Logo.svg'

export const PLUGIN_GUARD_CONTENT = {
  'bit-form': {
    logo: bitFormLogo,
    notActivated: {
      buttonLabel: __('Activate'),
      subTitle: __('Bit Form plugin is installed but not activated. Please activate it to continue.'),
      title: __('Bit Form Plugin Not Activated')
    },
    notInstalled: {
      buttonLabel: __('Install and Activate'),
      subTitle: __(
        'Bit Form plugin is required for this integration. Please install and activate it to continue.'
      ),
      title: __('Bit Form Plugin Not Installed')
    }
  },
  'bit-integrations': {
    logo: bitIntegrationsLogo,
    notActivated: {
      buttonLabel: __('Activate'),
      subTitle: __(
        'Bit Integration plugin is installed but not activated. Please activate it to continue.'
      ),
      title: __('Bit Integration Plugin Not Activated')
    },
    notInstalled: {
      buttonLabel: __('Install and Activate'),
      subTitle: __(
        'Bit Integration plugin is required for this integration. Please install and activate it to continue.'
      ),
      title: __('Bit Integration Plugin Not Installed')
    }
  },
  'bit-pi': {
    logo: bitFlowsLogo,
    notActivated: {
      buttonLabel: __('Activate'),
      subTitle: __('Bit Flows plugin is installed but not activated. Please activate it to continue.'),
      title: __('Bit Flows Plugin Not Activated')
    },
    notInstalled: {
      buttonLabel: __('Install and Activate'),
      subTitle: __(
        'Bit Flows plugin is required for this integration. Please install and activate it to continue.'
      ),
      title: __('Bit Flows Plugin Not Installed')
    }
  },
  'bit-smtp': {
    logo: bitSmtpLogo,
    notActivated: {
      buttonLabel: __('Activate'),
      subTitle: __('Bit SMTP plugin is installed but not activated. Please activate it to continue.'),
      title: __('Bit SMTP Plugin Not Activated')
    },
    notInstalled: {
      buttonLabel: __('Install and Activate'),
      subTitle: __(
        'Bit SMTP plugin is required to configure SMTP settings. Please install and activate it to continue.'
      ),
      title: __('Bit SMTP Plugin Not Installed')
    }
  }
}

export type PluginSlug = keyof typeof PLUGIN_GUARD_CONTENT
