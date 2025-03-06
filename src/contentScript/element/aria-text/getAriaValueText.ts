import { getRole } from '../../roles'

export function getValidAriaValueText(htmlElement: HTMLElement) {
  const role = getRole(htmlElement)

  const ariaValueTextRoles = [
    'range',
    'separator',
    'spinbutton',
    'meter',
    'progressbar',
    'scrollbar',
    'slider',
    'spinbutton',
  ] // list obtained from https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-valuetext

  if (role && !ariaValueTextRoles.includes(role)) {
    return null
  }

  return htmlElement.getAttribute('aria-valuetext')
}
