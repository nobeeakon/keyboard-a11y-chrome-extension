import { getTagName } from '../element/tagInfo'
import { log, type LogType } from '../logger'
import { getHtmlString } from '../element/getHtmlString'
import { getCssSelector } from '../element/getCssSelector'
import type { TextInfo } from './types'

// obtained from https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#name_calculation
const getFallbackText = (htmlNode: HTMLElement, logs: LogType[]): TextInfo | undefined => {
  const tagName = getTagName(htmlNode)

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
            displayText: 'Avoid browser Fallback',
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

      return { type: "'title' attribute", text: title }
    }
  }
}

export default getFallbackText
