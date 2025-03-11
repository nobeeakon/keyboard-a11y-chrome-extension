import { log, type LogType } from '../logger'
import { getHtmlString } from './getHtmlString'
import { getCssSelector } from './getCssSelector'

export function getTabIndex(htmlElement: HTMLElement, logs: LogType[]) {
  const tabIndexString = htmlElement.getAttribute('tabindex')?.toString()
  const tabIndexInt = tabIndexString ? parseInt(tabIndexString, 10) : undefined
  const isOnlyDigits = tabIndexString ? /^\-{0,1}\d+$/.test(tabIndexString) : true // defaulting to true in case it doesn't exist

  const tabIndexNumeric =
    !isOnlyDigits || tabIndexInt == null || isNaN(tabIndexInt) || !isFinite(tabIndexInt)
      ? null
      : tabIndexInt

  if (!!tabIndexString && !isOnlyDigits) {
    logs.push(
      log.warn({
        issue: 'tabindex contains non numeric values',
        htmlElement: getHtmlString(htmlElement),
        htmlElementSelector: getCssSelector(htmlElement),
        message: `tabindex="${tabIndexString}"`,
      }),
    )
  }

  if (tabIndexInt != null && (tabIndexInt > 0 || tabIndexInt < -1)) {
    logs.push(
      log.warn({
        issue: tabIndexInt > 0 ? 'tabindex > 0' : 'tabindex < -1',
        htmlElement: getHtmlString(htmlElement),
        htmlElementSelector: getCssSelector(htmlElement),
        message:
          tabIndexInt < -1
            ? undefined
            : 'This is valid only if it improves accessibility, e.g. in skip links',
      }),
    )
  }

  return tabIndexNumeric
}
