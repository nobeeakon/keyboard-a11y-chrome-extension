import { getAriaLabel } from './ariaLabel'
import { getAriaLabelledBy } from './ariaLabelledBy'
import { log, type LogType } from '../../logger'
import { requiresAriaLabel } from './requiresAriaLabel'
import { getRole } from '../../roles'
import { getHtmlString } from '../getHtmlString'
import getCssSelector from 'css-selector-generator'

export function getAriaLabelText(htmlElement: HTMLElement, logs: LogType[]) {
  // 'aria-labelledby' takes precedence over 'aria-label'
  const labelledBy = getAriaLabelledBy(htmlElement, logs)
  if (labelledBy != null && labelledBy !== '') {
    return { type: 'aria-labelledby' as const, text: labelledBy }
  }

  const ariaLabel = getAriaLabel(htmlElement, logs)
  if (ariaLabel != null && ariaLabel !== '') {
    return { type: 'aria-label' as const, text: ariaLabel }
  }

  if (requiresAriaLabel(htmlElement)) {
    const role = getRole(htmlElement)
    logs.push(
      log.minor({
        issue: `Role '${role ?? ''}' requires aria label`,
        htmlElement: getHtmlString(htmlElement),
        htmlElementSelector: getCssSelector(htmlElement),
        additionalInfo: [
          {
            href: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/',
            displayText: ' Accessible Name Guidance by Role',
          },
        ],
      }),
    )
  }
}
