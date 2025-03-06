export function getTagName(htmlElement: HTMLElement) {
  return htmlElement.tagName?.toLowerCase()
}

export function isHTMLTag(htmlElement: HTMLElement) {
  return getTagName(htmlElement) === 'html'
}
