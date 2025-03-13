import { getRole } from '../roles'
import searchInParent from '../element/searchInParent'
import { getTagName } from '../element/tagInfo'
import getAccessibleText from './getAccessibleText'
import type { LogType } from '../logger'
import { isAriaHidden, isElementHidden } from '../element/elementHidden'

// list obtained from https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#name_calculation
const ROLES_NAMED_FROM_DESCENDANT = new Set([
  'button',
  'cell',
  'checkbox',
  'columnheader',
  'gridcell',
  'heading',
  'link',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'radio',
  'row',
  'rowheader',
  'switch',
  'tab',
  'tooltip',
  'treeitem',
])

export const isObtainTextFromContent = (htmlElement: HTMLElement) => {
  const role = getRole(htmlElement)

  // https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#name_calculation
  if (role === 'menuitem') {
    // menuitem (content contained in a child menu element is excluded.)
    const menuElement = searchInParent(htmlElement, (currentElement) => {
      return getTagName(currentElement) === 'menu'
    })

    return !menuElement
  } else if (role === 'treeitem') {
    // treeitem (content included in a child group element is excluded.)
    const groupElement = searchInParent(htmlElement, (currentElement) => {
      return getTagName(currentElement) === 'group'
    })

    return !groupElement
  }

  return role ? ROLES_NAMED_FROM_DESCENDANT.has(role) : false
}

let visitedNodes: null | Set<HTMLElement> = null
/** This function can be recursively called, thus we need to keep track of which elements have been visited */
const getTextFomContent = (
  htmlElement: HTMLElement,
  logs: LogType[],
  ignoreHtmlElement?: HTMLElement,
) => {
  if (!visitedNodes) {
    visitedNodes = new Set(ignoreHtmlElement ? [ignoreHtmlElement] : [])
  }
  if (visitedNodes.has(htmlElement)) {
    return { status: 'visited' as const }
  }
  visitedNodes.add(htmlElement)

  const accessibleTextArray = []
  for (const child of htmlElement.childNodes) {
    const childText = getAccessibleText(child, logs) // Recursive call
    if (childText?.text) {
      accessibleTextArray.push(childText.text)
    }
  }
  const nestedText = accessibleTextArray.join(' ').replace(/\s+/g, ' ').trim()

  return { status: 'new' as const, text: nestedText }
}

const cleanGetFromText = () => (visitedNodes = null)

// TODO maybe abstract this into a factory or something?

export default { getTextFomContent, cleanGetFromText }
