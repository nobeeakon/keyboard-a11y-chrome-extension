import { getTagName } from './tagInfo'

const CONTROL_TAGS_SET = new Set([
  'input',
  'meter',
  'output',
  'progress',
  'select',
  'textarea',
  'progress',
])
/** Checks if an element is a form control, these includes `<input>`, `<textarea>` and others */
export function isElementWithLabel(htmlElement: HTMLElement) {
  return CONTROL_TAGS_SET.has(getTagName(htmlElement))
}

export function getNestedInteractiveElementsQueries(htmlElement: HTMLElement) {
  const queries = [
    'button',
    'a',
    'input',
    'select',
    'textarea',
    'label',
    'menu',
    'details', // with <summary>
    'video[controls]',
    'audio[controls]',
    '[tabindex="0"]',
    '[tabindex="-1"]', // can be interactive by javascript
    '[role="button"]', // not by itself but can be interactive  with tabindex
  ]

  const results = queries.map((queryItem) =>
    htmlElement.querySelector(queryItem) ? queryItem : null,
  )
  return results.filter(Boolean)
}
