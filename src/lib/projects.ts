/**
 * Project data for the "Selected Work" section.
 * `previewImg` is intentionally left undefined for now — the UI renders a
 * styled placeholder block until real imagery is dropped in.
 */
export interface Project {
  num: string
  title: string
  subtitle: string
  description: string
  tags: string[]
  previewImg?: string
  url?: string
}

export const projects: Project[] = [
  {
    num: '01',
    title: 'Creative Courses',
    subtitle: 'Video learning platform',
    description: 'Curated video learning platform for film disciplines.',
    tags: ['Laravel', 'Tailwind', 'Alpine'],
  },
  {
    num: '02',
    title: 'Edenic Collectible Toys',
    subtitle: 'Premium e-commerce',
    description: "Cosmic 'toy museum at midnight' collectible toys store.",
    tags: ['Laravel', 'GSAP', 'Three.js'],
  },
  {
    num: '03',
    title: 'Coming Soon',
    subtitle: 'Placeholder project',
    description: 'A new project — details coming soon.',
    tags: ['TBA'],
  },
]
