import { __ } from '@common/helpers/i18nWrap'

export const PLUGIN_GUARD_CONTENT = {
  'bit-form': {
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
