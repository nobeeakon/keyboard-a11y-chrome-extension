// taken from https://stackoverflow.com/questions/42184322/javascript-get-element-unique-selector
export function elemToSelector(htmlElement: HTMLElement): string {
  const { tagName, id, className, parentElement } = htmlElement

  if (tagName === 'HTML') return 'HTML'

  let str = tagName

  str += id !== '' ? `#${id}` : ''

  if (className) {
    const classes = className.split(/\s/)
    for (let i = 0; i < classes.length; i++) {
      str += `.${classes[i]}`
    }
  }

  let childIndex = 1

  for (let e: Element = htmlElement; e.previousElementSibling; e = e.previousElementSibling) {
    childIndex += 1
  }

  str += `:nth-child(${childIndex})`

  return !parentElement ? str : `${elemToSelector(parentElement)} > ${str}`
}
