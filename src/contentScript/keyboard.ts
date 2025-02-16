import { LOG_ID, log, type LogType } from './logger'
import { getRole } from './roles'

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
function getHtmlString(htmlElement: HTMLElement) {
  const outerHtml = htmlElement.outerHTML

  const regexp = /\<.+?\>/

  return outerHtml.match(regexp)?.[0]
}

function isHtmlTextNode(htmlNode: Node) {
  return htmlNode.nodeType === 3
}

function isHtmlElement(htmlNode: Node): htmlNode is HTMLElement {
  return htmlNode.nodeType === 1
}

type GetComputeStyles = (elt: Element, pseudoElt?: string | null) => CSSStyleDeclaration

function isElementHidden(htmlElement: HTMLElement, getComputedStyle: GetComputeStyles) {
  const style = getComputedStyle(htmlElement)
  return style?.display === 'none' || style?.visibility === 'hidden' || htmlElement.hidden
}

function isAriaHidden(htmlElement: HTMLElement) {
  return htmlElement.getAttribute('aria-hidden') === 'true'
}

function isRolePresentation(htmlElement: HTMLElement) {
  return htmlElement.getAttribute('role') === 'presentation'
}

function getTabIndex(htmlElement: HTMLElement, logs: LogType[]) {
  const tabIndexString = htmlElement.tabIndex?.toString()
  const tabIndexInt = tabIndexString ? parseInt(tabIndexString) : undefined
  const isOnlyDigits = /^\d+$/.test(tabIndexString)

  const tabIndexNumeric =
    !isOnlyDigits || tabIndexInt == null || isNaN(tabIndexInt) ? null : tabIndexInt

  if (!!tabIndexString && !isOnlyDigits) {
    logs.push(
      log.warn({
        id: LOG_ID.warn.tabindexNonNumeric,
        issue: 'tabindex contains non numeric values',
        data: { htmlElement: getHtmlString(htmlElement) },
        message: `tabindex="${tabIndexString}"`,
      }),
    )
  }

  if (tabIndexInt != null && (tabIndexInt > 0 || tabIndexInt < -1)) {
    logs.push(
      log.warn({
        id: LOG_ID.warn.tabindexInvalid,
        issue: tabIndexInt > 0 ? 'tabindex > 0' : 'tabindex < -1',
        data: { htmlElement: getHtmlString(htmlElement) },
        message:
          tabIndexInt < -1
            ? undefined
            : 'This is valid only if it improves accessibility, like in skip links',
      }),
    )
  }

  return tabIndexNumeric == null || isNaN(tabIndexNumeric) ? null : tabIndexNumeric
}

function getTagName(htmlElement: HTMLElement) {
  return htmlElement.tagName?.toLowerCase()
}

function getValidAriaValueText(htmlElement: HTMLElement) {
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

  if (isControlElement(htmlNode)) {
    const inputLabel = getInputLabel(htmlNode, logs)

    if (inputLabel) {
      return { type: '<input> label', text: inputLabel }
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
          ],
          data: {
            htmlElement: getHtmlString(htmlNode),
          },
        }),
      )

      return { type: '<input> placeholder', text: inputPlaceholder }
    }
  }

  // 'aria-labelledby' takes precedence over 'aria-label'
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

  const title = htmlNode.title
  if (title) {
    return { type: 'element title', text: title.trim() }
  }

  if (htmlNode.tagName.toLowerCase() === 'figcaption') {
    return htmlNode.textContent == null
      ? null
      : { type: 'figcaption text', text: htmlNode.textContent.trim() }
  }

  // TODO this needs to consider if is text node or not...
  // if (node.nodeType === Node.TEXT_NODE)
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

  return null
}

function getNestedInteractiveElementsQueries(htmlElement: HTMLElement) {
  const queries = [
    'button',
    'a',
    'input',
    'select',
    'textarea',
    'label',
    'menu',
    'details', // with <summary>
    'video[controls]',
    'audio[controls]',
    '[tabindex="0"]',
    '[tabindex="-1"]', // can be interactive by javascript
    '[role="button"]', // not by itself but can be interactive  with tabindex
  ]

  const results = queries.map((queryItem) =>
    htmlElement.querySelector(queryItem) ? queryItem : null,
  )
  return results.filter(Boolean)
}

// taken from https://stackoverflow.com/questions/42184322/javascript-get-element-unique-selector
function elemToSelector(htmlElement: HTMLElement): string {
  const { tagName, id, className, parentElement } = htmlElement

  if (tagName === 'HTML') return 'HTML'

  let str = tagName

  str += id !== '' ? `#${id}` : ''

  if (className) {
    const classes = className.split(/\s/)
    for (let i = 0; i < classes.length; i++) {
      str += `.${classes[i]}`
    }
  }

  let childIndex = 1

  for (let e: Element = htmlElement; e.previousElementSibling; e = e.previousElementSibling) {
    childIndex += 1
  }

  str += `:nth-child(${childIndex})`

  return !parentElement ? str : `${elemToSelector(parentElement)} > ${str}`
}

function isHTMLTag(htmlElement: HTMLElement) {
  return getTagName(htmlElement) === 'html'
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
function validateAriaLabel(htmlElement: HTMLElement, logs: LogType[]) {
  const htmlString = getHtmlString(htmlElement)

  const role = getRole(htmlElement)

  if (!role) {
    logs.push(
      log.error({
        issue: 'aria label used in an element with no role',
        message:
          "'aria-label' is often ignored by assistive technologies in elements with no role like <div> or <span>. Prefer a semantic element, or add a role attribute",
        data: {
          htmlElement: getHtmlString(htmlElement),
        },
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
        data: {
          htmlElement: getHtmlString(htmlElement),
        },
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
        data: {
          htmlElement: htmlString,
        },
      }),
    )
  }

  if (isRolePresentation(htmlElement)) {
    logs.push(
      log.warn({
        issue: "using role='presentation' in an element with an aria label",
        data: {
          htmlElement: htmlString,
        },
      }),
    )
  }

  if (htmlElement.getAttribute('alt')?.trim() || htmlElement.getAttribute('title')?.trim()) {
    logs.push(
      log.minor({
        issue:
          "using aria label in an element with 'alt' or 'title'. Aria label will take precedence.",
        data: {
          htmlElement: htmlString,
        },
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
        data: {
          htmlElement: htmlString,
        },
      }),
    )
  }

  return true
}

function getAriaLabel(htmlElement: HTMLElement, logs: LogType[]) {
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
        data: {
          htmlElement: getHtmlString(htmlElement),
        },
      }),
    )
  }

  return ariaLabel
}

function getAriaLabelledBy(htmlElement: HTMLElement, logs: LogType[]) {
  const labelledById = htmlElement.getAttribute('aria-labelledby')?.trim()

  if (labelledById == null) {
    return null
  }

  const validAriaLabel = validateAriaLabel(htmlElement, logs)

  if (!validAriaLabel) {
    return null
  }

  const labelledElements = labelledById
    .split(' ')
    .map((idItem) => idItem.trim())
    .map((idItem) => document.getElementById(idItem))
    .filter(Boolean)
  if (labelledElements.length === 0) {
    logs.push(
      log.error({
        issue: 'aria-labelledby refers to an non-existing element',
        message: `target labelledById: ${labelledById}`,
        data: {
          htmlElement: getHtmlString(htmlElement),
        },
      }),
    )

    return null
  }

  const labelledByText = labelledElements
    .map((labelElementItem) => labelElementItem?.textContent?.trim() ?? '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (labelledByText === '') {
    logs.push(
      log.error({
        issue: 'aria-labelledby text is empty',
        message: `target labelledById: ${labelledById}`,
        data: {
          htmlElement: getHtmlString(htmlElement),
        },
      }),
    )
  }

  return labelledByText
}

function getAriaLabelText(htmlElement: HTMLElement, logs: LogType[]) {
  // 'aria-labelledby' takes precedence over 'aria-label'
  const labelledBy = getAriaLabelledBy(htmlElement, logs)
  if (labelledBy != null && labelledBy !== '') {
    return { type: 'aria-labelledby', text: labelledBy }
  }

  const ariaLabel = getAriaLabel(htmlElement, logs)
  if (ariaLabel != null && ariaLabel !== '') {
    return { type: 'aria-label', text: ariaLabel }
  }
}

const CONTROL_TAGS_SET = new Set(['input', 'meter', 'output', 'progress', 'select', 'textarea'])
/** Checks if an element is a form control, these includes <input>, <textarea> and others */
function isControlElement(htmlElement: HTMLElement) {
  return CONTROL_TAGS_SET.has(getTagName(htmlElement))
}

function getLabelElementText(labelElement: HTMLElement, logs: LogType[]) {
  const ariaLabel = getAriaLabelText(labelElement, logs)

  if (ariaLabel?.text) {
    logs.push(
      log.error({
        issue: '<label> using aria-label or aria-labelledby',
        data: {
          labelElement: getHtmlString(labelElement),
        },
      }),
    )

    return ariaLabel.text
  }

  const labelTextContent = labelElement.textContent?.trim()
  if (!labelTextContent) {
    logs.push(
      log.error({
        issue: '<label> missing text',
        data: {
          labelElement: getHtmlString(labelElement),
        },
      }),
    )

    return null
  }

  return labelTextContent
}

const SEARCH_UP_TREE_MAX = 500 // TODO abstract into a separate function that receives a callback

function getInputLabel(inputElement: HTMLElement, logs: LogType[]) {
  const ariaLabel = getAriaLabelText(inputElement, logs)
  if (ariaLabel?.text) {
    return ariaLabel.text
  }

  // `<label>` tag is in the parent
  let currentElement: HTMLElement | null = inputElement
  for (let i = 0; i < SEARCH_UP_TREE_MAX; i++) {
    if (!currentElement || isHTMLTag(currentElement)) {
      break
    }

    if (getTagName(currentElement) === 'label') {
      return getLabelElementText(currentElement, logs)
    }

    currentElement = currentElement.parentElement
  }

  // check label has for=""
  const elementId = inputElement.id?.trim()
  if (!elementId) return null

  const labelElements = [...document.querySelectorAll(`label[for="${elementId}"]`)] as HTMLElement[] // TODO fix this type

  if (labelElements.length > 1) {
    logs.push(
      log.error({
        issue: 'multiple <label>',
        data: {
          inputElement: getHtmlString(inputElement),
          labelElement: labelElements
            .map((labelElementItem) => getHtmlString(labelElementItem))
            .join(' '),
        },
      }),
    )
  }

  if (labelElements.length === 0) {
    logs.push(
      log.error({
        issue: 'missing <label>',
        data: { inputElement: getHtmlString(inputElement) },
      }),
    )
  }

  if (labelElements.length === 1) {
    return getLabelElementText(labelElements[0], logs)
  }

  return null
}

function elementValidations(htmlElement: HTMLElement, logs: LogType[]) {
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

/**
 * parses the html and get all required information.
 *  - NOTE: this should be a pure function, that do not depend on window or any other external method. This to be able to test the results.
 **/
function getElementInfo(
  htmlElement: HTMLElement,
  locationHref: string,
  getComputedStyle: GetComputeStyles,
) {
  const logs: LogType[] = []

  const role = getRole(htmlElement)
  const tagName = getTagName(htmlElement)
  const tabIndex = getTabIndex(htmlElement, logs)
  const selector = elemToSelector(htmlElement)

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

export default getElementInfo
export type ElementInfo = ReturnType<typeof getElementInfo>
