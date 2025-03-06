import { log, LOG_ID, type LogType } from '../logger'
import { getHtmlString } from './getHtmlString'

export function getTabIndex(htmlElement: HTMLElement, logs: LogType[]) {
  const tabIndexString = htmlElement.tabIndex?.toString()
  const tabIndexInt = tabIndexString ? parseInt(tabIndexString) : undefined
  const isOnlyDigits = /^\-{0,1}\d+$/.test(tabIndexString)

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
