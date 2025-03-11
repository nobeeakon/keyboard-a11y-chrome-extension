import { getHtmlString } from '../getHtmlString'
import { log, type LogType } from '../../logger'
import { getRole, isRolePresentation } from '../../roles'
import { isAriaHidden } from '../elementHidden'
import { getCssSelector } from '../getCssSelector'

const ARIA_LABEL_NOT_SUPPORTED_ROLES_SET = new Set([
  'code',
  'term',
  'emphasis',
  'deletion',
  'insertion',
  'mark',
  'subscript',
  'superscript',
  'time',
  'caption',
  'definition',
  'generic',
  'presentation',
  'paragraph',
  'none',
  'strong',
  'suggestion',
]) // list taken from https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label#associated_roles

/** Validates elements using 'aria-label' or 'aria-labelledby' */
export function validateAriaLabel(htmlElement: HTMLElement, logs: LogType[]) {
  const htmlString = getHtmlString(htmlElement)
  const htmlElementSelector = getCssSelector(htmlElement)

  const role = getRole(htmlElement)

  if (!role) {
    logs.push(
      log.error({
        issue: 'aria label used in an element with no role',
        message:
          "'aria-label' is often ignored by assistive technologies in elements with no role like <div> or <span>. Prefer a semantic element, or add a role attribute",
        htmlElement: htmlString,
        htmlElementSelector,
        additionalInfo: [
          {
            href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label',
            displayText: 'MDN: not all elements can be given accessible name',
          },
        ],
      }),
    )

    return false
  }

  if (ARIA_LABEL_NOT_SUPPORTED_ROLES_SET.has(role)) {
    logs.push(
      log.error({
        issue: 'Element does not support aria label',
        message: `Element with role="${role}" does not support aria label.`,
        htmlElement: htmlString,
        htmlElementSelector,
        additionalInfo: [
          {
            href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label#associated_roles',
            displayText: 'MDN: aria label not supported roles',
          },
        ],
      }),
    )

    return false
  }

  if (isAriaHidden(htmlElement)) {
    logs.push(
      log.warn({
        issue: "using 'aria-hidden' in an element with an aria label",
        htmlElement: htmlString,
        htmlElementSelector,
      }),
    )
  }

  if (isRolePresentation(htmlElement)) {
    logs.push(
      log.warn({
        issue: "using role='presentation' in an element with an aria label",
        htmlElement: htmlString,
        htmlElementSelector,
      }),
    )
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
