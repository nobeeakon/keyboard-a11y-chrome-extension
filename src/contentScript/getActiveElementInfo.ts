import { log, type LogType } from './logger'
import { getRole } from './roles'
import { GetComputeStyles } from './element/types'
import { isElementHidden, isAriaHidden } from './element/elementHidden'
import { isHtmlTextNode, isHtmlElement } from './element/nodeType'
import { getHtmlString } from './element/getHtmlString'
import { getTagName } from './element/tagInfo'
import { isElementWithLabel } from './element/isControlElement'
import { getTabIndex } from './element/getTabIndex'
import { getAriaLabelText } from './element/aria-text/getAriaLabel'
import { elementValidations } from './element/elementValidations'
// import { getValidAriaValueText } from './element/aria-text/getAriaValueText' // TODO check what to do with this one?
import { getInputLabel } from './element/getInputLabel'
import { getCssSelector, startCssSelectorCache } from './element/getCssSelector'
import searchInParent from './element/searchInParent'

const CONSOLE_LOG_PREFFIX = '[a11y]'

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
const isObtainTextFromContent = (htmlElement: HTMLElement) => {
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

  return !role ? true : ROLES_NAMED_FROM_DESCENDANT.has(role)
}

export const getTextFomContent = (htmlElement: HTMLElement, logs: LogType[]) => {
  const accessibleTextArray = []
  for (const child of htmlElement.childNodes) {
    const childText = getAccessibleText(child, logs, getComputedStyle) // Recursive call
    if (childText?.text) {
      accessibleTextArray.push(childText.text)
    }
  }
  const nestedText = accessibleTextArray.join(' ').replace(/\s+/g, ' ').trim()

  return nestedText
}

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
function getAccessibleText(
  htmlNode: Node,
  logs: LogType[],
  getComputedStyle: GetComputeStyles,
): { text: string; type: string } | null | undefined {
  if (isHtmlTextNode(htmlNode)) {
    return htmlNode.textContent == null
      ? null
      : { type: 'text node', text: htmlNode.textContent ?? '' }
  }

  if (!isHtmlElement(htmlNode)) {
    return null
  }

  if (isAriaHidden(htmlNode) || isElementHidden(htmlNode, getComputedStyle)) {
    return null
  }

  const tagName = getTagName(htmlNode)

  // https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#name_calculation
  // 1: The aria-labelledby property is used if present.  2: If the name is still empty, the aria-label property is used if present.
  const ariaLabelText = getAriaLabelText(htmlNode, logs)
  if (ariaLabelText?.text) {
    return { type: ariaLabelText.type, text: ariaLabelText.text }
  }

  // https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#name_calculation
  // 3. If the name is still empty, then host-language-specific attributes or elements are used if present
  if (
    tagName === 'input' &&
    ['button', 'submit', 'reset'].includes(htmlNode.getAttribute('type') ?? '')
  ) {
    // input whose type attribute is in the Button, Submit Button, or Reset Button state: The value attribute.
    const value = htmlNode.getAttribute('value')

    if (value) {
      return {
        type: 'input button',
        text: value,
      }
    }
  } else if (
    (tagName === 'input' && htmlNode.getAttribute('type') === 'image') ||
    tagName === 'img' ||
    tagName === 'area'
  ) {
    // input whose type attribute is in the Image Button state  img  area
    const altText = htmlNode.getAttribute('alt')
    if (altText) {
      logs.push(
        log.info({
          message: `Images should not have redundant 'alt' text: don't use 'image', 'photo', 'picture' or similar`,
          htmlElement: getHtmlString(htmlNode),
          htmlElementSelector: getCssSelector(htmlNode),
          additionalInfo: [
            {
              href: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/alt',
              displayText: 'MDN alt property',
            },
            {
              href: 'https://webaim.org/techniques/alttext/',
              displayText: 'Web AIM alt text',
            },
          ],
        }),
      )

      return { type: `${tagName} alt`, text: `[img:${altText.trim()}]` }
    }
  } else if (tagName === 'fieldset') {
    // fieldset:     The first child legend element.
    const legendElement = htmlNode.querySelector('legend')

    const textContent = legendElement ? getTextFomContent(legendElement, logs) : null

    if (textContent) {
      return {
        type: 'fieldset legend',
        text: textContent,
      }
    }
  } else if (isElementWithLabel(htmlNode)) {
    const inputLabel = getInputLabel(htmlNode, logs)

    if (inputLabel) {
      return { type: `${tagName} <label>`, text: inputLabel }
    }

    logs.push(
      log.warn({
        issue: `${htmlNode} element missing label`,
        htmlElement: getHtmlString(htmlNode),
        htmlElementSelector: getCssSelector(htmlNode),
      }),
    )
  } else if (tagName === 'figure') {
    // figure:     The first child figcaption element.
    const figCaptionElement = htmlNode.querySelector('figcaption')

    const textContent = figCaptionElement ? getTextFomContent(figCaptionElement, logs) : null

    if (textContent) {
      return {
        type: 'figure figcaption',
        text: textContent,
      }
    }
  } else if (tagName === 'table') {
    // table:     The first child caption element.
    const captionElement = htmlNode.querySelector('caption')

    const textContent = captionElement ? getTextFomContent(captionElement, logs) : null

    if (textContent) {
      return {
        type: 'table caption',
        text: textContent,
      }
    }
  }

  // TODO in terms of hierarchy where does this fits?? vs alt vs value vs title vs aria label ...
  // const ariaValueText = getValidAriaValueText(htmlNode)
  // if (ariaValueText) {
  //   return { type: 'aria-valuetext', text: ariaValueText }
  // }

  //  https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#accessiblenamecalculation
  // 4 If the name is still empty, then for elements with a role that supports naming from child content, the content of the element is used.
  if (isObtainTextFromContent(htmlNode)) {
    const nestedText = getTextFomContent(htmlNode, logs)

    if (nestedText) {
      return { type: 'nested text', text: nestedText }
    }
  }

  // https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#accessiblenamecalculation
  // 5  Finally, if the name is still empty, then other fallback host-language-specific attributes or elements are used if present
  if (
    (tagName === 'input' &&
      ['text', 'password', 'search', 'telephone', 'url'].includes(
        htmlNode.getAttribute('type') ?? 'text',
      )) ||
    tagName === 'textarea'
  ) {
    // The title attribute. Otherwise, the placeholder attribute: input whose type attribute is in the Text, Password, Search, Telephone, or URL states. Also  textarea
    const title = htmlNode.getAttribute('title')?.trim()
    if (title) {
      logs.push(
        log.warn({
          issue: "using 'title' attribute as a placeholder",
          message: 'prefer using a visible text or aria text',
          additionalInfo: [
            {
              href: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions#naming_rule_avoid_fallback',
              displayText: ' Avoid browser Fallback',
            },
          ],
          htmlElement: getHtmlString(htmlNode),
          htmlElementSelector: getCssSelector(htmlNode),
        }),
      )

      return { type: 'element title', text: title }
    }

    const placeholder = htmlNode.getAttribute('placeholder')?.trim()
    if (placeholder) {
      logs.push(
        log.warn({
          issue: "using 'placeholder' attribute as a placeholder",
          message: 'prefer using a visible text or aria text',
          additionalInfo: [
            {
              href: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions#naming_rule_avoid_fallback',
              displayText: ' Avoid browser Fallback',
            },
          ],
          htmlElement: getHtmlString(htmlNode),
          htmlElementSelector: getCssSelector(htmlNode),
        }),
      )

      return { type: 'element placeholder', text: placeholder }
    }
  } else if (tagName === 'input' && htmlNode.getAttribute('type') === 'submit') {
    // input whose type attribute is in the Submit Button state

    logs.push(
      log.warn({
        issue: "using localized 'Submit' as a placeholder",
        message: 'prefer using a visible text or aria text',
        additionalInfo: [
          {
            href: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions#naming_rule_avoid_fallback',
            displayText: ' Avoid browser Fallback',
          },
        ],
        htmlElement: getHtmlString(htmlNode),
        htmlElementSelector: getCssSelector(htmlNode),
      }),
    )

    return { type: 'input submit placeholder text', text: 'Submit' }
  } else if (tagName === 'input' && htmlNode.getAttribute('type') === 'reset') {
    // input whose type attribute is in the Reset Button state

    logs.push(
      log.warn({
        issue: "using localized 'Reset' as a placeholder",
        message: 'prefer using a visible text or aria text',
        additionalInfo: [
          {
            href: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions#naming_rule_avoid_fallback',
            displayText: ' Avoid browser Fallback',
          },
        ],
        htmlElement: getHtmlString(htmlNode),
        htmlElementSelector: getCssSelector(htmlNode),
      }),
    )

    return { type: 'input reset placeholder text', text: 'Reset' }
  } else if (tagName === 'input' && htmlNode.getAttribute('type') === 'image') {
    // input whose type attribute is in the Image Button state
    const title = htmlNode.getAttribute('title')?.trim()
    if (title) {
      logs.push(
        log.warn({
          issue: "using 'title' attribute as a placeholder",
          message: 'prefer using a visible text or aria text',
          additionalInfo: [
            {
              href: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions#naming_rule_avoid_fallback',
              displayText: ' Avoid browser Fallback',
            },
          ],
          htmlElement: getHtmlString(htmlNode),
          htmlElementSelector: getCssSelector(htmlNode),
        }),
      )

      return { type: 'input image title', text: title }
    }

    logs.push(
      log.warn({
        issue: "using localized 'Submit Query' as a placeholder",
        message: 'prefer using a visible text or aria text',
        additionalInfo: [
          {
            href: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions#naming_rule_avoid_fallback',
            displayText: ' Avoid browser Fallback',
          },
        ],
        htmlElement: getHtmlString(htmlNode),
        htmlElementSelector: getCssSelector(htmlNode),
      }),
    )

    return { type: 'input image placeholder text', text: 'Submit Query' }
  } else if (tagName === 'summary') {
    logs.push(
      log.warn({
        issue: "using localized 'Details' as a placeholder",
        message: 'prefer using a visible text or aria text',
        additionalInfo: [
          {
            href: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions#naming_rule_avoid_fallback',
            displayText: ' Avoid browser Fallback',
          },
        ],
        htmlElement: getHtmlString(htmlNode),
        htmlElementSelector: getCssSelector(htmlNode),
      }),
    )

    return { type: 'summary placeholder text', text: 'Details' }
  } else if (htmlNode.getAttribute('title')?.trim()) {
    // Other elements: The title attribute.
    const title = htmlNode.getAttribute('title')?.trim()
    if (title) {
      logs.push(
        log.warn({
          issue: "using 'title' attribute as a placeholder",
          message: 'prefer using a visible text or aria text',
          additionalInfo: [
            {
              href: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions#naming_rule_avoid_fallback',
              displayText: ' Avoid browser Fallback',
            },
          ],
          htmlElement: getHtmlString(htmlNode),
          htmlElementSelector: getCssSelector(htmlNode),
        }),
      )

      return { type: 'input image title', text: title }
    }
  }

  return null
}

const dedupLogs = (logs: LogType[]) => {
  const prevLogIdSet = new Set()
  const sanitizedLogs: LogType[] = []

  logs.forEach((logItem) => {
    if (prevLogIdSet.has(logItem.id)) {
      return
    }

    sanitizedLogs.push(logItem)
    prevLogIdSet.add(logItem.id)
  })

  return sanitizedLogs
}

/**
 * parses the html and get all required information.
 *  - NOTE: this should be a pure function, that do not depend on window or any other external method. This to be able to test the results.
 **/
function getActiveElementInfo(
  htmlElement: HTMLElement,
  locationHref: string,
  getComputedStyle: GetComputeStyles,
) {
  startCssSelectorCache(htmlElement)
  const logs: LogType[] = []

  const role = getRole(htmlElement)
  const tagName = getTagName(htmlElement)
  const tabIndex = getTabIndex(htmlElement, logs)
  const selector = getCssSelector(htmlElement)

  // additional validations
  elementValidations(htmlElement, logs)

  let textInfo = null

  try {
    // This is a complex function, better have a try/catch
    textInfo = getAccessibleText(htmlElement, logs, getComputedStyle)
  } catch (e) {
    console.error(CONSOLE_LOG_PREFFIX, e)
  }

  if (!textInfo?.text) {
    logs.push(
      log.error({
        issue: 'focusable element missing text',
        htmlElement: getHtmlString(htmlElement),
        htmlElementSelector: selector,
      }),
    )
  }

  return {
    locationHref,
    role,
    tagName,
    text: textInfo?.text,
    textType: textInfo?.type,
    tabIndex,
    htmlElement: getHtmlString(htmlElement),
    selector,
    logs: dedupLogs(logs),
  }
}

export default getActiveElementInfo
export type ElementInfo = ReturnType<typeof getActiveElementInfo>
