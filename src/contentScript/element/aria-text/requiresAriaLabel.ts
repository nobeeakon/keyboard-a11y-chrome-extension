import { getRole } from '../../roles'

// taken from https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/
const requireAriaLabelOrLabelledBy = [
  'alertdialog',
  'application',
  'dialog',
  'radiogroup',
  'region',
  'tree',
]
const requiresAriaLabelledBy = ['tabpanel']
const ROLES_REQUIRE_ARIA_LABEL_OR_LABELLED_BY_SET = new Set([
  ...requireAriaLabelOrLabelledBy,
  ...requiresAriaLabelledBy,
])
export const requiresAriaLabel = (htmlElement: HTMLElement) => {
  const role = getRole(htmlElement)

  return !role ? false : ROLES_REQUIRE_ARIA_LABEL_OR_LABELLED_BY_SET.has(role)
}
