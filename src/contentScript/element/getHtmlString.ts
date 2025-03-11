const OPENING_TAG_REGEXP = /^<[^>]+>/
/** returns a string containing the opening tag as a string  */
export function getHtmlString(htmlElement: HTMLElement) {
  return htmlElement.outerHTML.match(OPENING_TAG_REGEXP)?.[0] as string
}
