/** Check if an element is hidden from assistive technologies  */
export function isElementHidden(htmlElement: HTMLElement) {
  const style = getComputedStyle(htmlElement)
  return style?.display === 'none' || style?.visibility === 'hidden' || htmlElement.hidden
}

export function isAriaHidden(htmlElement: HTMLElement) {
  return htmlElement.getAttribute('aria-hidden') === 'true'
}
