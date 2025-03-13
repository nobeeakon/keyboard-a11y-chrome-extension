import { getTagName } from '../element/tagInfo'
import { log, type LogType } from '../logger'
import { getHtmlString } from '../element/getHtmlString'
import { getCssSelector } from '../element/getCssSelector'
import { isElementWithLabel } from '../element/isControlElement'
import { getInputLabel } from '../element/getInputLabel'
import getTextFromContent from './getTextFromContent'
import type { TextInfo } from './types'

// obtained from https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#name_calculation
const getTextFromElementAttributes = (
  htmlNode: HTMLElement,
  logs: LogType[],
): TextInfo | undefined => {
  const tagName = getTagName(htmlNode)

  if (
    tagName === 'input' &&
    ['button', 'submit', 'reset'].includes(htmlNode.getAttribute('type') ?? '')
  ) {
    // input whose type attribute is in the Button, Submit Button, or Reset Button state: The value attribute.
    const value = htmlNode.getAttribute('value')

    if (value) {
      return {
        type: "<input> button 'value'",
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

      return { type: `'${tagName} 'alt`, text: `[img:${altText.trim()}]` }
    }
  } else if (tagName === 'fieldset') {
    // fieldset:     The first child legend element.
    const legendElement = htmlNode.querySelector('legend')

    const textContent = legendElement
      ? getTextFromContent.getTextFomContent(legendElement, logs)
      : null
    getTextFromContent.cleanGetFromText()

    if (textContent?.status === 'new' && textContent.text) {
      return {
        type: 'fieldset <legend>',
        text: textContent.text,
      }
    }
  } else if (isElementWithLabel(htmlNode)) {
    const inputLabel = getInputLabel(htmlNode, logs)
    if (inputLabel.status === 'visited') {
      return
    }

    if (inputLabel.text) {
      return { type: `${tagName} <label>`, text: inputLabel.text }
    }

    logs.push(
      log.warn({
        issue: `${tagName} element missing label`,
        htmlElement: getHtmlString(htmlNode),
        htmlElementSelector: getCssSelector(htmlNode),
      }),
    )
  } else if (tagName === 'figure') {
    // figure:     The first child figcaption element.
    const figCaptionElement = htmlNode.querySelector('figcaption')

    const textContent = figCaptionElement
      ? getTextFromContent.getTextFomContent(figCaptionElement, logs)
      : null
    getTextFromContent.cleanGetFromText()

    if (textContent?.status === 'new' && textContent.text) {
      return {
        type: 'figure figcaption',
        text: textContent.text,
      }
    }
  } else if (tagName === 'table') {
    // table:     The first child caption element.
    const captionElement = htmlNode.querySelector('caption')

    const textContent = captionElement
      ? getTextFromContent.getTextFomContent(captionElement, logs)
      : null
    getTextFromContent.cleanGetFromText()

    if (textContent?.status === 'new' && textContent.text) {
      return {
        type: 'table caption',
        text: textContent.text,
      }
    }
  }
}

export default getTextFromElementAttributes
