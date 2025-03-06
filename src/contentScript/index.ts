import getActiveElementInfo, { type ElementInfo } from './getActiveElementInfo.js'
import { getTagName } from './element/tagInfo.js'

const isHtmlElement = (element: Element): element is HTMLElement => element instanceof HTMLElement

const FOCUS_EVENT = 'FOCUS_EVENT' as const
export type FocusEvent = { type: typeof FOCUS_EVENT; data: ElementInfo }
export const isFocusEvent = (event: unknown): event is FocusEvent => {
  // NOTE: this is kind of a naive validation but works for the moment
  const isFocusType =
    !!event && typeof event === 'object' && 'type' in event && event.type === FOCUS_EVENT
  const hasFocusData =
    !!event &&
    typeof event === 'object' &&
    'data' in event &&
    !!event.data &&
    typeof event.data === 'object'

  if (isFocusType && hasFocusData) {
    return true
  }

  return false
}

let lastActive: Element | null = null

document.addEventListener('keyup', () => {
  if (document.activeElement !== lastActive) {
    lastActive = document.activeElement

    if (!lastActive || !isHtmlElement(lastActive) || getTagName(lastActive) === 'body') return

    const data = getActiveElementInfo(lastActive, window.location.href, window.getComputedStyle)

    const focusEvent: FocusEvent = { type: FOCUS_EVENT, data }

    chrome.runtime.sendMessage(focusEvent)
  }
})
