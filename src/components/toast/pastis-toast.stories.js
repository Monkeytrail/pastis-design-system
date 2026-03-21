import './pastis-toast.js';
import '../button/pastis-button.js';

export default {
  title: 'Feedback/Toast',
  component: 'pastis-toast',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'error', 'warning', 'info'] },
    position: { control: 'select', options: ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'] },
    duration: { control: 'number' },
    dismissible: { control: 'boolean' },
  },
};

export const Success = {
  render: () => `
    <pastis-button variant="primary" id="success-btn">▶ EXECUTE SAVE</pastis-button>
    <pastis-toast id="success-toast" variant="success" title="MISSION COMPLETE" message="STATE HAS BEEN SAVED SUCCESSFULLY." duration="4000" dismissible></pastis-toast>
    <script>
      document.getElementById('success-btn').addEventListener('click', () => {
        document.getElementById('success-toast').show();
      });
    </script>
  `,
};

export const Error = {
  render: () => `
    <pastis-button variant="destructive" id="error-btn">✕ TRIGGER FAULT</pastis-button>
    <pastis-toast id="error-toast" variant="error" title="CRITICAL ERROR DETECTED" message="SYSTEM FAILURE. RETRY SEQUENCE REQUIRED." duration="5000" dismissible></pastis-toast>
    <script>
      document.getElementById('error-btn').addEventListener('click', () => {
        document.getElementById('error-toast').show();
      });
    </script>
  `,
};

export const Warning = {
  render: () => `
    <pastis-button variant="secondary" id="warn-btn">◆ SYSTEM WARNING</pastis-button>
    <pastis-toast id="warn-toast" variant="warning" title="WARNING: LOW BATTERY" message="YOUR SESSION WILL TERMINATE IN 5 CYCLES." duration="6000" dismissible></pastis-toast>
    <script>
      document.getElementById('warn-btn').addEventListener('click', () => {
        document.getElementById('warn-toast').show();
      });
    </script>
  `,
};

export const MultipleToasts = {
  render: () => `
    <div style="display:flex;gap:16px;flex-wrap:wrap;padding:24px;background:#000000;">
      <pastis-button variant="primary" id="t1-btn">▶ SUCCESS</pastis-button>
      <pastis-button variant="destructive" id="t2-btn">✕ ERROR</pastis-button>
      <pastis-button variant="secondary" id="t3-btn">◆ INFO</pastis-button>
    </div>
    <pastis-toast id="t1" variant="success" title="MISSION COMPLETE" message="OPERATION COMPLETED." dismissible></pastis-toast>
    <pastis-toast id="t2" variant="error" title="CRITICAL ERROR DETECTED" message="COULD NOT COMPLETE OPERATION." dismissible></pastis-toast>
    <pastis-toast id="t3" variant="info" title="SYSTEM INFO" message="SYSTEM INFO AVAILABLE." dismissible></pastis-toast>
    <script>
      ['t1','t2','t3'].forEach(id => {
        document.getElementById(id+'-btn').addEventListener('click', () => document.getElementById(id).show());
      });
    </script>
  `,
};
