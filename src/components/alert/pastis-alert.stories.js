import './pastis-alert.js';

export default {
  title: 'Feedback/Alert',
  component: 'pastis-alert',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
    title: { control: 'text' },
    dismissible: { control: 'boolean' },
  },
  render: (args) => `
    <pastis-alert
      variant="${args.variant || 'info'}"
      title="${args.title || ''}"
      ${args.dismissible ? 'dismissible' : ''}
      style="max-width:480px"
    >${args.message || 'SYSTEM INFO AVAILABLE'}</pastis-alert>
  `,
};

export const Info = { args: { variant: 'info', title: 'SYSTEM INFO', message: 'SYSTEM INFO AVAILABLE' } };
export const Success = { args: { variant: 'success', title: 'MISSION COMPLETE', message: 'ALL CHANGES HAVE BEEN SAVED TO STATE.' } };
export const Warning = { args: { variant: 'warning', title: 'WARNING: LOW BATTERY', message: 'YOUR POWER CELLS EXPIRE IN 3 CYCLES.' } };
export const Error = { args: { variant: 'error', title: 'CRITICAL ERROR DETECTED', message: 'FAILED TO SAVE STATE. RETRY SEQUENCE.' } };
export const Dismissible = { args: { variant: 'info', title: 'INCOMING TRANSMISSION', message: 'NEW UPGRADES ARE AVAILABLE.', dismissible: true } };

export const AllVariants = {
  render: () => `
    <div style="display:flex;flex-direction:column;gap:16px;max-width:480px;padding:24px;background:#000000;">
      <pastis-alert variant="info" title="SYSTEM INFO">SYSTEM INFO AVAILABLE</pastis-alert>
      <pastis-alert variant="success" title="MISSION COMPLETE">ALL CHANGES SAVED SUCCESSFULLY.</pastis-alert>
      <pastis-alert variant="warning" title="WARNING: LOW BATTERY">POWER CELLS EXPIRE IN 3 CYCLES.</pastis-alert>
      <pastis-alert variant="error" title="CRITICAL ERROR DETECTED" dismissible>FAILED TO CONNECT. CHECK YOUR UPLINK.</pastis-alert>
    </div>
  `,
};
