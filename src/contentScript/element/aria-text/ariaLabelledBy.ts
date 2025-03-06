import { log, type LogType } from '../../logger'
import { getHtmlString } from '../getHtmlString'
import { validateAriaLabel } from './ariaLabel'

// TODO what about aria-describedby
// TODO aria-labelledby https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#naming_with_child_content mentions that it incorporates names from visibility:hidden and so
// TODO  https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/ There are certain types of elements, such as paragraphs and list items, that should not be named with aria-label. They are identified in the table in the Accessible Name Guidance by Role section.
// TODO https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/  Because the value of aria-label is not rendered visually, testing with assistive technologies to ensure the expected name is presented to users is particularly important.
// TODO usage of aria-labelledby in input, this is a warning because label does handle click -> focus, but labelledby don't
export function getAriaLabelledBy(htmlElement: HTMLElement, logs: LogType[]) {
  const labelledById = htmlElement.getAttribute('aria-labelledby')?.trim()

  if (labelledById == null) {
    return null
  }

  const validAriaLabel = validateAriaLabel(htmlElement, logs)

  if (!validAriaLabel) {
    return null
  }

  // https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#naming_with_child_content
  //  If an element is referenced more than one time, only the first reference is processed
  const prevIdsSet = new Set()
  const labelledElements = labelledById
    .trim()
    .split(' ')
    .map((idItem) => idItem.trim())
    .map((idItem) => {
      if (prevIdsSet.has(idItem)) return null

      prevIdsSet.add(idItem)
      return document.getElementById(idItem)
    })
    .filter(Boolean)
  if (labelledElements.length === 0) {
    logs.push(
      log.error({
        issue: 'aria-labelledby refers to an non-existing element',
        message: `target labelledById: ${labelledById}`,
        data: {
          htmlElement: getHtmlString(htmlElement),
        },
      }),
    )

    return null
  }

  // The aria-labelledby property cannot be chained
  const labelledByText = labelledElements
    .map((labelElementItem) => labelElementItem?.textContent?.trim() ?? '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (labelledByText === '') {
    logs.push(
      log.error({
        issue: 'aria-labelledby text is empty',
        message: `target labelledById: ${labelledById}`,
        data: {
          htmlElement: getHtmlString(htmlElement),
        },
      }),
    )
  }

  return labelledByText
}
