import { type Preview } from '@storybook/react'
import React from 'react'

import StoriesWrapper from './StoriesWrapper'

const preview: Preview = {
  decorators: [
    Story => (
      <StoriesWrapper>
        <Story />
      </StoriesWrapper>
    )
  ],

  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    layout: 'centered'
  },

  tags: ['autodocs']
}

export default preview
