import { getTagName } from './tagInfo'
import { getAriaLabelText } from './aria-text/getAriaLabel'
import { log, type LogType } from '../logger'
import { getHtmlString } from './getHtmlString'
import { getCssSelector } from './getCssSelector'
import searchInParent from './searchInParent'
import getTextFromContent from '../accessible-name/getTextFromContent'

function getLabelElementText(
  labelElement: HTMLElement,
  logs: LogType[],
  inputElement: HTMLElement,
) {
  const ariaLabel = getAriaLabelText(labelElement, logs)

  if (ariaLabel?.text) {
    logs.push(
      log.error({
        issue: `<label> using '${ariaLabel.type}'`,
        htmlElement: getHtmlString(labelElement),
        htmlElementSelector: getCssSelector(labelElement),
      }),
    )

    return { status: 'new' as const, text: ariaLabel.text }
  }

  const labelTextContent = getTextFromContent.getTextFomContent(labelElement, logs, inputElement)
  getTextFromContent.cleanGetFromText()
  if (labelTextContent.status === 'new' && !labelTextContent.text) {
    logs.push(
      log.error({
        issue: '<label> missing text',
        htmlElement: getHtmlString(labelElement),
        htmlElementSelector: getCssSelector(labelElement),
      }),
    )
  }


  return labelTextContent
}

type GetInputResponse =
  | {
      status: 'new'
      text: string | null
    }
  | {
      status: 'visited'
      text?: never
    }

/** This is a function that can be called recursively in case the input element has a label as its parent
 * thus it needs to recognize if the element has been previously visited or not
 */
export function getInputLabel(inputElement: HTMLElement, logs: LogType[]): GetInputResponse {
  const ariaLabel = getAriaLabelText(inputElement, logs)
  const htmlElementString = getHtmlString(inputElement)
  const htmlElementSelector = getCssSelector(inputElement)

  if (ariaLabel?.text) {
    if (ariaLabel.type === 'aria-labelledby') {
      logs.push(
        log.warn({
          issue: "using 'aria-labelledby' as an input label",
          message:
            'prefer using the <label> tag or confirm that clicking the label element focuses the <input>',
          htmlElement: htmlElementString,
          htmlElementSelector,
        }),
      )
    }

    return { status: 'new' as const, text: ariaLabel.text }
  }

  // `<label>` tag is in the parent
  const parentLabelElement = searchInParent(inputElement, (currentElement) => {
    return getTagName(currentElement) === 'label'
  })

  if (parentLabelElement && getTagName(parentLabelElement) === 'label') {
    return getLabelElementText(parentLabelElement, logs, inputElement)
  }

  // check label has for=""
  const elementId = inputElement.id?.trim()
  if (!elementId) return { status: 'new' as const, text: null }

  const labelElements = [...document.querySelectorAll(`label[for="${elementId}"]`)] as HTMLElement[] // TODO fix this type

  if (labelElements.length === 0) {
    return { status: 'new' as const, text: '' }
  }

  if (labelElements.length > 1) {
    logs.push(
      log.warn({
        issue: 'multiple <label>',
        htmlElement: htmlElementString,
        htmlElementSelector,
        data: {
          labelElement: labelElements
            .map((labelElementItem) => getHtmlString(labelElementItem))
            .join(' '),
        },
      }),
    )
  }

  // TODO check what happens in this case... like how to get to the right text. (consider label, aria-label, etc...)
  // for example <label id="hola1" for="input1">hola 1</label><label id="hola2" for="input1">hola 2</label><input type="text" id="input1" >
  const labelsText = labelElements
    .map((labelItem) => getLabelElementText(labelItem, logs, inputElement).text ?? '')
    .join(' ')

  return { status: 'new' as const, text: labelsText }
}
