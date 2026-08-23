import './pastis-section.js';

export default {
  title: 'Layout/Section',
  component: 'pastis-section',
  tags: ['autodocs'],
  argTypes: {
    align:      { control: 'select', options: ['left', 'center', 'right'] },
    padding:    { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    background: { control: 'select', options: ['primary', 'card', 'elevated', 'none'] },
    hasDivider: { control: 'boolean' },
  },
  render: (args) => `
    <pastis-section
      label="${args.label || 'Work'}"
      heading="${args.heading || 'Selected Projects'}"
      subheading="${args.subheading || 'A curated set of work spanning design systems, product interfaces, and creative experiments.'}"
      align="${args.align || 'left'}"
      padding="${args.padding || 'md'}"
      background="${args.background || 'primary'}"
      ${args.hasDivider ? 'has-divider' : ''}
    >
      <p style="color:var(--text-tertiary);font-family:var(--font-family-body);font-size:14px;">
        ← Slot content goes here (cards, grid, etc.)
      </p>
    </pastis-section>
  `,
};

export const Default = { args: {} };
export const Centered = { args: { align: 'center' } };
export const CardBackground = { args: { background: 'card' } };
export const WithDivider = { args: { hasDivider: true } };

export const PortfolioPage = {
  render: () => `
    <div style="background:#0d0d0d;">
      <pastis-section
        label="About"
        heading="I Build Things for the Web"
        subheading="Senior frontend engineer specialising in design systems, accessibility, and component architecture. 6 years shipping products people use every day."
        align="center"
        padding="lg"
      ></pastis-section>

      <pastis-section
        label="Work"
        heading="Selected Projects"
        has-divider
        background="card"
      >
        <p style="color:var(--text-tertiary);font-family:var(--font-family-body);font-size:14px;margin:0;">
          ← Project cards go here
        </p>
      </pastis-section>

      <pastis-section
        label="Experience"
        heading="Career Timeline"
        has-divider
      >
        <p style="color:var(--text-tertiary);font-family:var(--font-family-body);font-size:14px;margin:0;">
          ← Timeline component goes here
        </p>
      </pastis-section>
    </div>
  `,
};
