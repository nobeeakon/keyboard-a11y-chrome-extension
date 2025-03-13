import { log, type LogType } from './logger'
import { getRole } from './roles'
import { GetComputeStyles } from './element/types'
import { getHtmlString } from './element/getHtmlString'
import { getTagName } from './element/tagInfo'
import { getTabIndex } from './element/getTabIndex'
import { elementValidations } from './element/elementValidations'
// import { getValidAriaValueText } from './element/aria-text/getAriaValueText' // TODO check what to do with this one?
import { getCssSelector, startCssSelectorCache } from './element/getCssSelector'
import getAccessibleText from './accessible-name/getAccessibleText'

const CONSOLE_LOG_PREFFIX = '[a11y]'

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
function getActiveElementInfo(htmlElement: HTMLElement, locationHref: string) {
  startCssSelectorCache(htmlElement)
  const logs: LogType[] = []
  const role = getRole(htmlElement, logs)
  const tagName = getTagName(htmlElement)
  const tabIndex = getTabIndex(htmlElement, logs)
  const selector = getCssSelector(htmlElement)

  // additional validations
  elementValidations(htmlElement, logs)

  let textInfo = null

  try {
    // This is a complex function, better have a try/catch
    textInfo = getAccessibleText(htmlElement, logs, true)
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
