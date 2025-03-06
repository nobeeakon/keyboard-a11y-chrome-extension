import { log, type LogType } from '../logger'
import { isAriaHidden } from './elementHidden'
import { getHtmlString } from './getHtmlString'
import { getAriaLabelText } from './aria-text/getAriaLabel'
import { getRole, isRolePresentation } from '../roles'
import { getTagName } from './tagInfo'
import { isHTMLTag } from './tagInfo'
import { getNestedInteractiveElementsQueries } from './isControlElement'

export function elementValidations(htmlElement: HTMLElement, logs: LogType[]) {
  const htmlString = getHtmlString(htmlElement)

  if (isAriaHidden(htmlElement)) {
    logs.push(
      log.warn({
        issue: "focusable element with 'aria-hidden'",
        data: {
          htmlElement: htmlString,
        },
      }),
    )
  }

  if (isRolePresentation(htmlElement)) {
    logs.push(
      log.warn({
        issue: 'focusable element with role="presentation"',
        data: {
          htmlElement: htmlString,
        },
      }),
    )

    if (getAriaLabelText(htmlElement, logs)?.text) {
      logs.push(
        log.warn({
          issue: "role='presentation' with aria label ('aria-label' or 'aria-labelledby')",
          message:
            "If the element is just presentational it doesn't need aria text. If is not purely presentational please use another role or prefer html semantic elements like <button>",
          data: {
            htmlElement: htmlString,
          },
          additionalInfo: [
            {
              href: 'https://a11ytips.dev/docs/roles-vs-presentation/',
              displayText: "aria-hidden vs role='presentation'",
            },
          ],
        }),
      )
    }
  }

  const role = getRole(htmlElement)
  if (!role) {
    logs.push(
      log.warn({
        issue: 'focusable element with no role',
        message:
          'Is OK to not have focusable elements without roles if is a list or similar cases, not for clickable items', // TODO improve the message
        data: { htmlElement: htmlString },
      }),
    )
  }

  if (
    role === 'button' &&
    getTagName(htmlElement) !== 'input' &&
    getTagName(htmlElement) !== 'button'
  ) {
    logs.push(
      log.warn({
        issue: "role='button' not using <button> html tag",
        message:
          "When possible prefer to use the '<button>' html tag. Otherwise, confirm that this element is keyboard accessible ('enter', 'space') and that handles focus properly.",
        data: { htmlElement: htmlString },
      }),
    )
  }

  const insideAriaHiddenElement = getInsideAriaHiddenElement(htmlElement)
  if (insideAriaHiddenElement) {
    logs.push(
      log.warn({
        issue: 'element inside aria-hidden',
        data: {
          htmlElement: htmlString,
          ariaHiddenElement: getHtmlString(insideAriaHiddenElement),
        },
      }),
    )
  }

  const nestedInteractive = getNestedInteractiveElementsQueries(htmlElement)
  const isRoleGrid = role === 'grid'

  if (isRoleGrid) {
    if (nestedInteractive.length === 0) {
      logs.push(
        log.warn({
          issue: "'grid' role with no interactive element",
          data: { htmlElement: htmlString },
          additionalInfo: [
            {
              href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/grid_role',
              displayText: 'MDN: grid role',
            },
          ],
        }),
      )
    } else {
      logs.push(
        log.info({
          data: { htmlElement: htmlString },
          message:
            "'grid' role. Confirm that the elements inside are keyboard accessible (Arrow keys, etc.)",
          additionalInfo: [
            {
              href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/grid_role#keyboard_interactions',
              displayText: "MDN: 'grid' role keyboard interactions",
            },
          ],
        }),
      )
    }
  }

  const isValidToHaveNestedInteractive = role === 'list' || isRoleGrid

  if (!isValidToHaveNestedInteractive && nestedInteractive.length > 0) {
    const message = `Includes: ${nestedInteractive.join(', ')}`
    logs.push(
      log.error({
        issue: 'element contains nested controls',
        message,
        data: {
          htmlElement: htmlString,
        },
        additionalInfo: [
          {
            href: 'https://accessibleweb.com/question-answer/why-are-nested-interactive-controls-an-accessibility-issue/',
            displayText: 'Why nested interactive elements is an a11y issue?',
          },
        ],
      }),
    )
  }
}

function getInsideAriaHiddenElement(htmlElement: HTMLElement): HTMLElement | null {
  if (!htmlElement || isHTMLTag(htmlElement)) {
    return null
  }

  if (isAriaHidden(htmlElement)) {
    return htmlElement
  }

  return !htmlElement.parentElement ? null : getInsideAriaHiddenElement(htmlElement.parentElement)
}
