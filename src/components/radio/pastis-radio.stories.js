import './pastis-radio.js';

export default {
  title: 'Forms/Radio',
  component: 'pastis-radio',
  tags: ['autodocs'],
};

export const Default = {
  render: () => `<pastis-radio label="Option A" name="demo" value="a"></pastis-radio>`,
};

export const Checked = {
  render: () => `<pastis-radio label="Option B" name="demo2" value="b" checked></pastis-radio>`,
};

export const WithHelper = {
  render: () => `<pastis-radio label="Pro plan" helper="$12/month, unlimited users" name="plan" value="pro"></pastis-radio>`,
};

export const Disabled = {
  render: () => `<pastis-radio label="Unavailable option" name="demo3" value="x" disabled></pastis-radio>`,
};

export const Group = {
  render: () => `
    <div style="display:flex;flex-direction:column;gap:12px;font-family:'Courier New',monospace">
      <pastis-radio label="Option A" name="group" value="a" checked></pastis-radio>
      <pastis-radio label="Option B" name="group" value="b"></pastis-radio>
      <pastis-radio label="Option C (disabled)" name="group" value="c" disabled></pastis-radio>
    </div>
  `,
};
