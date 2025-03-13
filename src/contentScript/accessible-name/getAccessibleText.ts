import { isHtmlTextNode, isHtmlElement } from '../element/nodeType'
import type { LogType } from '../logger'
import { isAriaHidden, isElementHidden } from '../element/elementHidden'
import { getAriaLabelText } from '../element/aria-text/getAriaLabel'
import getTextFromContent, { isObtainTextFromContent } from './getTextFromContent'
import getTextFromElementAttributes from './getTextFromElementAttributes'
import getFallbackText from './getFallbackText'
import type { TextInfo } from './types'

// TODO
// - [ ]  iframes. Should use MutationObserver , log that it is inside an iframe
// - [ ] TODO check if is contained in a focusable element
// - [ ]  TODO how does contained rule applies for elements that are visually (not in html) inside others
// - [ ] TODO aria-activedescendants https://rules.sonarsource.com/javascript/tag/accessibility/RSPEC-6823/
// - [ ] TODO when is it valid to have interactive elements inside interactive elements? clickableNestedElementsQueries
// https://rules.sonarsource.com/javascript/tag/accessibility/RSPEC-6851/
// - [ ]  TODO roles vs semantic elements 'Avoid using .. ' https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles#2._widget_roles
// - [ ] TODO tablist role can contain other interactive elements?
// - [ ] TODO element size, relevant for links and buttons, and others? are there different rules for each? Think buttons need more since they are not necessarily inlined in a text?
// - [ ] TODO summary element is focusable  https://www.a11yproject.com/checklist/   'HTML > BODY.template-checklist:nth-child(2) > MAIN#main.l-main:nth-child(5) > DIV.l-toc:nth-child(1) > DETAILS.v-toc:nth-child(1) > SUMMARY.v-toc__summary:nth-child(1)'
// - [ ] TODO not reading the WCAG `<a href="https://www.w3.org/WAI/standards-guidelines/wcag/">The Web Content Accessibility Guidelines (<abbr>WCAG</abbr>)</a>`
// - [ ] TODO what about custom components?
// - [ ] TODO valid autocomplete   https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete    https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill  https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill-field
// aria-describedby vs aria-details vs aria-description https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-details
// TODO what to do with: getValidAriaValueText?
// - [ ] TODO can <label> have an aria label  "It incorporates content from elements regardless of their visibility, i.e., it even includes content from elements with the HTML hidden attribute, CSS display: none, or CSS visibility: hidden in the calculated name string."  https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/
// - [ ] TODO which roles can have aria labels or not? 'none' , 'presentation' what others?  https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/
function getAccessibleText(
  htmlNode: Node,
  logs: LogType[],
  isMainElement?: boolean,
): TextInfo | null | undefined {
  if (isHtmlTextNode(htmlNode)) {
    return htmlNode.textContent == null
      ? null
      : { type: 'text node', text: htmlNode.textContent ?? '' }
  }

  if (!isHtmlElement(htmlNode)) {
    return null
  }

  if (isAriaHidden(htmlNode) || isElementHidden(htmlNode)) {
    return null
  }

  // https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#name_calculation
  // 1: The aria-labelledby property is used if present.  2: If the name is still empty, the aria-label property is used if present.
  const ariaLabelText = getAriaLabelText(htmlNode, logs)
  if (ariaLabelText?.text) {
    return { type: ariaLabelText.type, text: ariaLabelText.text }
  }

  // https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#name_calculation
  // 3. If the name is still empty, then host-language-specific attributes or elements are used if present
  const textFromElementAttributes = getTextFromElementAttributes(htmlNode, logs)
  if (textFromElementAttributes?.text) {
    return textFromElementAttributes
  }

  //  https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#accessiblenamecalculation
  // 4 If the name is still empty, then for elements with a role that supports naming from child content, the content of the element is used.
  const isGetTextFromContent =
    (isMainElement && isObtainTextFromContent(htmlNode)) || !isMainElement
  if (isGetTextFromContent) {
    const nestedText = getTextFromContent.getTextFomContent(htmlNode, logs)
    getTextFromContent.cleanGetFromText()

    if (nestedText.status === 'visited') {
      return
    }

    if (nestedText.status === 'new' && nestedText.text) {
      return { type: 'nested text', text: nestedText.text }
    }
  }

  // https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#accessiblenamecalculation
  // 5  Finally, if the name is still empty, then other fallback host-language-specific attributes or elements are used if present
  const fallbackText = getFallbackText(htmlNode, logs)
  if (fallbackText?.text) {
    return fallbackText
  }

  return null
}

export default getAccessibleText
