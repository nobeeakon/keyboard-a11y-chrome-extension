import { getCssSelector } from 'css-selector-generator'

import { log, type LogType } from './logger'
import { getRole } from './roles'
import { GetComputeStyles } from './element/types'
import { isElementHidden, isAriaHidden } from './element/elementHidden'
import { isHtmlTextNode, isHtmlElement } from './element/nodeType'
import { getHtmlString } from './element/getHtmlString'
import { getTagName, isHTMLTag } from './element/tagInfo'
import { isElementWithLabel } from './element/isControlElement'
import { getTabIndex } from './element/getTabIndex'
import { getAriaLabelText } from './element/aria-text/getAriaLabel'
import { elementValidations } from './element/elementValidations'
import { getValidAriaValueText } from './element/aria-text/getAriaValueText'
import { getInputLabel } from './element/getInputLabel'

const CONSOLE_LOG_PREFFIX = '[a11y]'

// TODO
// - [ ] in some cases it doesn't pass the information. Check https://www.tripadvisor.com/ with the banner that has a link "Travelers' choice bes of best .." with link "see the list"
// - [ ]  iframes. Should use MutationObserver , log that it is inside an iframe
// - [ ] TODO check if is contained in a focusable element
// - [ ]  TODO how does contained rule applies for elements that are visually (not in html) inside others
// - [ ] TODO what to do with title property? https://rules.sonarsource.com/javascript/tag/accessibility/RSPEC-6827/ .. think it had some a11y concerns
// - [ ] TODO aria-activedescendants https://rules.sonarsource.com/javascript/tag/accessibility/RSPEC-6823/
// - [ ] TODO when is it valid to have interactive elements inside interactive elements? clickableNestedElementsQueries
// https://rules.sonarsource.com/javascript/tag/accessibility/RSPEC-6851/
// - [ ] TODO logs should have an ID or something so that I can filter duplicates
// - [ ] TODO inspect element button
// - [ ]  TODO roles vs semantic elements 'Avoid using .. ' https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles#2._widget_roles
// - [ ]  TODO title vs other things. And check if they have different info.... In the case of <input title="Escriba lo que quiere buscar." placeholder="Término de búsqueda"> Title is the one that wins for voice over
// - [ ] TODO input value read when no other is available? vs aria-labell/edby vs title vs placeholder vs value
// - [ ] TODO open inspector
// - [ ] TODO tablist role can contain other interactive elements?
// - [ ]  TODO link with no text does it reads href last part of the url?
// - [ ] TODO <input img alt>  https://webaim.org/blog/the-a-t-experiment/ in the search icon
// - [ ] TODO element size, relevant for links and buttons, and others? are there different rules for each? Think buttons need more since they are not necessarily inlined in a text?
// - [ ] TODO title attribute  https://stackoverflow.com/questions/72717612/are-title-attributes-harmless, https://www.w3.org/WAI/WCAG22/Techniques/html/H65  , https://www.a11yproject.com/posts/title-attributes/
// - [ ] TODO summary element is focusable  https://www.a11yproject.com/checklist/   'HTML > BODY.template-checklist:nth-child(2) > MAIN#main.l-main:nth-child(5) > DIV.l-toc:nth-child(1) > DETAILS.v-toc:nth-child(1) > SUMMARY.v-toc__summary:nth-child(1)'
// - [ ] TODO not reading the WCAG `<a href="https://www.w3.org/WAI/standards-guidelines/wcag/">The Web Content Accessibility Guidelines (<abbr>WCAG</abbr>)</a>`
// - [ ] TODO what about custom components?
// - [ ] TODO valid autocomplete
// - [ ] TODO in youtube it doesn't register video's thumbs up or thumbs down focus https://www.youtube.com/watch?v=yrnXdzQRISM
// - [ ] TODO how to handle multiple labels, and what to show as an additional documentation
// TODO  https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#name_calculation https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/ w3c name calculation
// https://www.w3.org/TR/accname-1.2/
// aria-describedby vs aria-details vs aria-description https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-details
// - [ ] TODO see Tiendas oficiales: https://www.mercadolibre.com.mx/ofertas/envio-gratis#menu=categories . It doesn't always get's the right text
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

  if (isElementWithLabel(htmlNode)) {
    const inputLabel = getInputLabel(htmlNode, logs)

    if (inputLabel) {
      return { type: `${getTagName(htmlNode)} <label>`, text: inputLabel }
    }

    logs.push(
      log.warn({
        issue: '<input> element missing label',
        data: {
          htmlElement: getHtmlString(htmlNode),
        },
      }),
    )

    const inputPlaceholder = htmlNode.getAttribute('placeholder')?.trim()
    if (!inputLabel && inputPlaceholder) {
      logs.push(
        log.warn({
          issue: "<input> using 'placehoder' instead of a label",
          message: "prefer <label> or 'aria-label' or 'aria-labelledby'",
          additionalInfo: [
            {
              href: 'https://www.a11yproject.com/posts/placeholder-input-elements/',
              displayText: 'placeholder vs label',
            },
            {
              href: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions#naming_rule_avoid_fallback',
              displayText: ' Avoid browser Fallback',
            },
          ],
          data: {
            htmlElement: getHtmlString(htmlNode),
          },
        }),
      )

      return { type: '<input> placeholder', text: inputPlaceholder }
    }
  }

  const ariaLabelText = getAriaLabelText(htmlNode, logs)
  if (ariaLabelText?.text) {
    return { type: ariaLabelText.type, text: ariaLabelText.text }
  }

  // TODO in terms of hierarchy where does this fits?? vs alt vs value vs title vs aria label ...
  const ariaValueText = getValidAriaValueText(htmlNode)
  if (ariaValueText) {
    return { type: 'aria-valuetext', text: ariaValueText }
  }

  if (htmlNode.tagName.toLowerCase() === 'img') {
    const altText = htmlNode.getAttribute('alt')
    if (altText) {
      logs.push(
        log.info({
          message: `Images should not have redundant 'alt' text: don't use 'image', 'photo', 'picture' or similar`,
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

      return { type: 'image alt', text: `[img:${altText.trim()}]` }
    }
  }

  if (htmlNode.tagName.toLowerCase() === 'figcaption') {
    return htmlNode.textContent == null
      ? null
      : { type: 'figcaption text', text: htmlNode.textContent.trim() }
  }

  const accessibleTextArray = []
  for (const child of htmlNode.childNodes) {
    const childText = getAccessibleText(child, logs, getComputedStyle) // Recursive call
    if (childText?.text) {
      accessibleTextArray.push(childText.text)
    }
  }
  const nestedText = accessibleTextArray.join(' ').trim()
  if (nestedText) {
    return { type: 'nested text', text: nestedText }
  }

  // title is used as a fallback in case other options failed
  const title = htmlNode.title?.trim()
  if (title) {
    logs.push(
      log.warn({
        issue: "using 'title' as a placeholder",
        message: 'prefer using a visible text or aria text',
        additionalInfo: [
          {
            href: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions#naming_rule_avoid_fallback',
            displayText: ' Avoid browser Fallback',
          },
        ],
        data: {
          htmlElement: getHtmlString(htmlNode),
        },
      }),
    )

    return { type: 'element title', text: title.trim() }
  }

  return null
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
        data: {
          htmlElement: getHtmlString(htmlElement),
        },
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
    logs,
  }
}

export default getActiveElementInfo
export type ElementInfo = ReturnType<typeof getActiveElementInfo>
