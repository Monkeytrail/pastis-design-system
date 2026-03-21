import './pastis-file-upload.js';

export default {
  title: 'Basics/FileUpload',
  component: 'pastis-file-upload',
  tags: ['autodocs'],
  argTypes: {
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
    accept: { control: 'text' },
    maxSize: { control: 'number' },
    label: { control: 'text' },
    helper: { control: 'text' },
  },
  render: (args) => {
    const el = document.createElement('pastis-file-upload');
    if (args.label) el.label = args.label;
    if (args.helper) el.helper = args.helper;
    if (args.accept) el.accept = args.accept;
    if (args.maxSize) el.maxSize = args.maxSize;
    el.multiple = args.multiple || false;
    el.disabled = args.disabled || false;
    el.style.maxWidth = '480px';
    el.style.display = 'block';
    return el;
  },
};

export const Default = { args: { label: 'UPLOAD DATA FILE', helper: 'DRAG & DROP OR CLICK TO BROWSE' } };
export const Multiple = { args: { label: 'UPLOAD MISSION FILES', multiple: true, helper: 'SELECT MULTIPLE FILES AT ONCE' } };
export const ImagesOnly = { args: { label: 'PLAYER AVATAR', accept: 'image/*', helper: 'PNG, JPG, GIF — MAX 5MB' } };
export const Disabled = { args: { label: 'FILE UPLOAD (LOCKED)', disabled: true } };

export const PDFUpload = { args: { label: 'UPLOAD MISSION DOSSIER', accept: '.pdf,.doc,.docx', helper: 'PDF, DOC, DOCX ACCEPTED — MAX 20MB', maxSize: 20 } };
