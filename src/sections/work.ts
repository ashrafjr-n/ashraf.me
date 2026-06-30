/**
 * "Selected Work" as depth items.
 *
 * Each project keeps its existing two-column layout, but instead of stacking in
 * document flow it becomes its own depth item positioned by the depth engine —
 * starting deep in front of the camera and emerging/growing as the camera flies
 * in. No ScrollTrigger, no normal-flow layout.
 */
import { projects, type Project } from '../lib/projects'
import { registerSection } from '../lib/depth'

/** Small typed helper for building elements with class + innerHTML. */
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  html?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (html !== undefined) node.innerHTML = html
  return node
}

/** Text column: num, title, subtitle, description, tag chips. */
function buildText(project: Project): HTMLDivElement {
  const text = el('div', 'project__text')

  const tags = el('ul', 'project__tags')
  for (const tag of project.tags) {
    tags.append(el('li', 'project__tag', tag))
  }

  text.append(
    el('span', 'project__num', project.num),
    el('h2', 'project__title', project.title),
    el('p', 'project__subtitle', project.subtitle),
    el('p', 'project__desc', project.description),
    tags,
  )
  return text
}

/** Preview column: real image if present, else a styled placeholder box. */
function buildPreview(project: Project): HTMLDivElement {
  const preview = el('div', 'project__preview')

  if (project.previewImg) {
    const img = el('img')
    img.src = project.previewImg
    img.alt = `${project.title} preview`
    img.loading = 'lazy'
    preview.append(img)
  } else {
    preview.append(el('div', 'project__placeholder', '<span>Project preview</span>'))
  }
  return preview
}

/** One project as a depth item. Even rows (0-based) reverse the column order. */
function buildProjectItem(project: Project, index: number): HTMLElement {
  const item = el('div', 'depth-item depth-item--project')

  const reverse = index % 2 === 1
  const article = el('article', `project${reverse ? ' project--reverse' : ''}`)
  article.append(buildText(project), buildPreview(project))

  item.append(article)
  return item
}

/**
 * Build the project depth items into `world` and register each with the depth
 * engine starting at `startIndex` (Hero occupies index 0).
 */
export function initWork(world: HTMLElement, startIndex: number): void {
  projects.forEach((project, i) => {
    const index = startIndex + i
    const item = buildProjectItem(project, i)
    world.append(item)
    registerSection(item, index)
  })
}
