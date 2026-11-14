import './pastis-statement.js';

export default {
  title: 'Portfolio/Statement',
  component: 'pastis-statement',
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['md', 'lg', 'xl'] },
    reveal: { control: 'boolean' },
  },
};

export const Default = {
  args: { size: 'xl', reveal: false },
  render: (args) => `
    <pastis-statement eyebrow="UX engineer · Antwerp" size="${args.size}" ${args.reveal ? 'reveal' : ''}>
      <h1>Design systems that ship, in <em>Figma</em> and in code.</h1>
    </pastis-statement>
  `,
};

export const Sizes = {
  render: () => `
    <div style="display:grid;gap:48px">
      <pastis-statement size="xl"><p>Extra large</p></pastis-statement>
      <pastis-statement size="lg"><p>Large statement</p></pastis-statement>
      <pastis-statement size="md"><p>Medium statement for section intros</p></pastis-statement>
    </div>
  `,
};
