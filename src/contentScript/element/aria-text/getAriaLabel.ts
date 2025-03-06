import { getAriaLabel } from './ariaLabel'
import { getAriaLabelledBy } from './ariaLabelledBy'
import type { LogType } from '../../logger'

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
}
