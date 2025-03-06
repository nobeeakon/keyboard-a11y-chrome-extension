/** returns a string containing the opening tag as a string  */
export function getHtmlString(htmlElement: HTMLElement) {
  const outerHtml = htmlElement.outerHTML

  const regexp = /\<.+?\>/

  return outerHtml.match(regexp)?.[0]
}
