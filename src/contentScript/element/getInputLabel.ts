import { isHTMLTag, getTagName } from './tagInfo'
import { getAriaLabelText } from './aria-text/getAriaLabel'
import { log, type LogType } from '../logger'
import { getHtmlString } from './getHtmlString'

const SEARCH_UP_TREE_MAX = 500 // TODO abstract into a separate function that receives a callback

function getLabelElementText(labelElement: HTMLElement, logs: LogType[]) {
  const ariaLabel = getAriaLabelText(labelElement, logs)

  if (ariaLabel?.text) {
    logs.push(
      log.error({
        issue: `<label> using '${ariaLabel.type}'`,
        data: {
          labelElement: getHtmlString(labelElement),
        },
      }),
    )

    return ariaLabel.text
  }

  const labelTextContent = labelElement.textContent?.trim() // TODO should it use something fancier than textContent?
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

export function getInputLabel(inputElement: HTMLElement, logs: LogType[]) {
  const ariaLabel = getAriaLabelText(inputElement, logs)
  if (ariaLabel?.text) {
    if (ariaLabel.type === 'aria-labelledby') {
      logs.push(
        log.warn({
          issue: "using 'aria-labelledby' as an input label",
          message:
            'prefer using the <label> tag or confirm that clicking the label element focuses the <input>',
          data: {
            inputElement: getHtmlString(inputElement),
          },
        }),
      )
    }

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

  if (labelElements.length === 0) {
    logs.push(
      log.error({
        issue: 'missing <label>',
        data: { inputElement: getHtmlString(inputElement) },
      }),
    )

    return null
  }

  if (labelElements.length > 1) {
    logs.push(
      log.warn({
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

  // TODO check what happens in this case... like how to get to the right text. (consider label, aria-label, etc...)
  // for example <label id="hola1" for="input1">hola 1</label><label id="hola2" for="input1">hola 2</label><input type="text" id="input1" >
  return labelElements.map((labelItem) => getLabelElementText(labelItem, logs)).join(' ')
}
