
module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-docs'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  features: {
    storyStoreV7: true
  },
  async viteFinal(config) {
    return {
      ...config,
      define: {
        ...config.define,
        global: 'globalThis'
      }
    };
  }
};
