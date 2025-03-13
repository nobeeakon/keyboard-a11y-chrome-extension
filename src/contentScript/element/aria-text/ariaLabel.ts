import { getHtmlString } from '../getHtmlString'
import { log, type LogType } from '../../logger'
import { isAriaHidden } from '../elementHidden'
import { getCssSelector } from '../getCssSelector'
import { getIsRoleWithoutAriaLabel } from '../../roles'

/** Validates elements using 'aria-label' or 'aria-labelledby' */
export function validateAriaLabel(htmlElement: HTMLElement, logs: LogType[]) {
  const htmlString = getHtmlString(htmlElement)
  const htmlElementSelector = getCssSelector(htmlElement)

  const roleWithoutAriaLabel = getIsRoleWithoutAriaLabel(htmlElement)

  if (!roleWithoutAriaLabel.isValidToHaveAriaLabel) {
    logs.push(
      log.error({
        issue: "aria label in a element that shouldn't use it",
        message: roleWithoutAriaLabel.role
          ? `Aria label shouldn't be used in role: ${roleWithoutAriaLabel.role}`
          : `Aria label shound't be used in an element with no role`,
        htmlElement: htmlString,
        htmlElementSelector,
        additionalInfo: [
          {
            href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label',
            displayText: 'MDN: not all elements can be given accessible name',
          },
          {
            href: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#accessiblenameguidancebyrole',
            displayText: 'w3: names and descriptions',
          },
          {
            href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label#associated_roles',
            displayText: 'MDN: aria label not supported roles',
          },
        ],
      }),
    )

    return true // default to true just to default but it has the above log
  }

  if (isAriaHidden(htmlElement)) {
    logs.push(
      log.warn({
        issue: "using 'aria-hidden' in an element with an aria label",
        htmlElement: htmlString,
        htmlElementSelector,
      }),
    )

    return false
  }

  if (htmlElement.getAttribute('alt')?.trim() || htmlElement.getAttribute('title')?.trim()) {
    logs.push(
      log.minor({
        issue:
          "using aria label in an element with 'alt' or 'title'. Aria label will take precedence.",
        htmlElement: htmlString,
        htmlElementSelector,
      }),
    )
  }

  if (
    htmlElement.getAttribute('aria-label')?.trim() &&
    htmlElement.getAttribute('aria-labelledby')?.trim()
  ) {
    logs.push(
      log.minor({
        issue:
          "using 'aria-label' and 'aria-labelledby' in the same element. 'aria-labelledby' will take precedence",
        message: "Prefer 'aria-labelledby' and consider removing 'aria-label'.",
        htmlElement: htmlString,
        htmlElementSelector,
      }),
    )
  }

  return true
}

export function getAriaLabel(htmlElement: HTMLElement, logs: LogType[]) {
  const ariaLabel = htmlElement.getAttribute('aria-label')?.trim()

  if (ariaLabel == null) {
    return null
  }

  const validAriaLabel = validateAriaLabel(htmlElement, logs)

  if (!validAriaLabel) {
    return null
  }

  if (ariaLabel === '') {
    logs.push(
      log.error({
        issue: 'Empty aria-label',
        htmlElement: getHtmlString(htmlElement),
        htmlElementSelector: getCssSelector(htmlElement),
      }),
    )
  }

  return ariaLabel
}
