import './pastis-shelf.js';
import '../project-card/pastis-project-card.js';

export default {
  title: 'Portfolio/Shelf',
  component: 'pastis-shelf',
  tags: ['autodocs'],
};

const ratios = ['2 / 3', '3 / 4', '4 / 5'];
const projects = ['Design System KION', 'Fleet management', 'Cultuurcentra', 'Stedelijk onderwijs', 'Maritime Academy', 'Sociale kaart'];

export const ProjectShelf = {
  render: () => `
    <pastis-shelf label="Selected work">
      ${projects.map((p, i) => `
        <pastis-project-card
          reveal
          href="#"
          heading="${p}"
          client="Client"
          year="2026"
          index="${String(i + 1).padStart(2, '0')}"
          image="https://picsum.photos/seed/shelf${i}/800/1100"
          style="--pastis-project-card-ratio: ${ratios[i % 3]}"
          tags='["Design system","Figma"]'
        ></pastis-project-card>
      `).join('')}
    </pastis-shelf>
  `,
};
