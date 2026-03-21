import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'Pastis Design System',
    brandUrl: '/',
    colorPrimary: '#0071E3',
    colorSecondary: '#0071E3',
    appBg: '#0A0A0F',
    appContentBg: '#111111',
    appBorderColor: '#3A3A3C',
    textColor: '#F5F5F7',
    textMutedColor: '#86868B',
  }),
});
