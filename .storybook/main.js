export default {
  stories: ['../src/**/*.stories.js'],

  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },

  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@chromatic-com/storybook'
  ],

  core: {
    disableWhatsNewNotifications: true
  }
};
