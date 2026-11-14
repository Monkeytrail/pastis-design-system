import './pastis-project-card.js';

export default {
  title: 'Portfolio/ProjectCard',
  component: 'pastis-project-card',
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['square', 'wide', 'tall'] },
  },
};

const img = 'https://picsum.photos/seed/pastis/1200/900';

export const Default = {
  args: { size: 'square' },
  render: (args) => `
    <div style="max-width:420px">
      <pastis-project-card
        href="#"
        heading="Design System KION"
        client="KION Group"
        year="2026"
        index="01"
        size="${args.size}"
        image="${img}"
        image-alt="Component library overview"
        summary="A unified design language for warehouse software."
        tags='["Design system","Figma","Web components"]'
      ></pastis-project-card>
    </div>
  `,
};

export const MixedGrid = {
  render: () => `
    <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:32px 24px;max-width:1200px">
      <pastis-project-card style="grid-column:span 7" size="wide" href="#" heading="Design System KION" client="KION Group" year="2026" index="01" image="${img}" tags='["Design system","Figma"]'></pastis-project-card>
      <pastis-project-card style="grid-column:span 5" size="tall" href="#" heading="Fleet management" client="KION Group" year="2026" index="02" image="https://picsum.photos/seed/fleet/900/1100" tags='["UX","Data viz"]'></pastis-project-card>
      <pastis-project-card style="grid-column:span 5" size="square" href="#" heading="Stedelijk onderwijs" client="viaVictor" year="2023" index="03" image="https://picsum.photos/seed/school/900/900"></pastis-project-card>
      <pastis-project-card style="grid-column:span 7" size="wide" href="#" heading="Cultuurcentra Antwerpen" client="viaVictor" year="2024" index="04" image="https://picsum.photos/seed/culture/1200/700"></pastis-project-card>
    </div>
  `,
};
