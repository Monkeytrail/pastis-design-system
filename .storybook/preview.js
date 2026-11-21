import '../src/tokens/index.css';

export const parameters = {
  backgrounds: { disable: true },
  actions: { argTypesRegex: '^on.*' },
  controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  options: { storySort: { order: ['Introduction', 'Foundations', 'Basics'] } },
};

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme',
    defaultValue: 'dark',
    toolbar: {
      icon: 'circlehollow',
      items: [
        { value: 'dark',  title: 'Dark',  icon: 'moon' },
        { value: 'light', title: 'Light', icon: 'sun' },
      ],
      dynamicTitle: true,
    },
  },
};

const bgMap = { dark: '#0d0d0d', light: '#f7f7f7' };

const withTheme = (Story, context) => {
  const theme = context.globals.theme || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  document.body.style.background = bgMap[theme] || bgMap.dark;
  return Story();
};

export const decorators = [withTheme];
