import './pastis-testimonial.js';

export default {
  title: 'Portfolio/Testimonial',
  component: 'pastis-testimonial',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'featured'] },
    rating:  { control: 'number', min: 0, max: 5 },
  },
  render: (args) => `
    <pastis-testimonial
      variant="${args.variant || 'default'}"
      quote="${args.quote || 'Working with this engineer transformed our product. Every component shipped was accessible, performant, and pixel-perfect.'}"
      name="${args.name || 'Sarah Okafor'}"
      role="${args.role || 'Head of Product'}"
      company="${args.company || 'Arclight Labs'}"
      rating="${args.rating ?? 5}"
      style="max-width:520px;display:block;"
    ></pastis-testimonial>
  `,
};

export const Default  = { args: {} };
export const Featured = { args: { variant: 'featured' } };
export const NoRating = { args: { rating: 0 } };

export const Grid = {
  render: () => `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;padding:32px;max-width:1100px;background:#0d0d0d;">
      <pastis-testimonial
        quote="A developer who genuinely cares about both craft and collaboration. Rare combination."
        name="Marcus Linh"
        role="Engineering Manager"
        company="Neon Systems"
        rating="5"
      ></pastis-testimonial>
      <pastis-testimonial
        variant="featured"
        quote="The design system they built cut our team's component dev time by 60%. It's still running in production two years later."
        name="Priya Sharma"
        role="CTO"
        company="Fielder"
        rating="5"
      ></pastis-testimonial>
      <pastis-testimonial
        quote="Incredibly thorough with accessibility. Every handoff included an axe-core report. Set the bar for the whole team."
        name="Tom Elbers"
        role="Lead Designer"
        company="Studiocraft"
        rating="5"
      ></pastis-testimonial>
    </div>
  `,
};
