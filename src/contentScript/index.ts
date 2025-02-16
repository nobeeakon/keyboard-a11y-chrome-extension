console.info('contentScript is running')
import getElementInfo, { type ElementInfo } from './keyboard.js'

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

document.addEventListener('focusin', () => {
  const currentElement = document.activeElement

  if (!currentElement || !isHtmlElement(currentElement)) return

  const data = getElementInfo(currentElement, window.location.href, window.getComputedStyle)

  const focusEvent: FocusEvent = { type: FOCUS_EVENT, data }

  chrome.runtime.sendMessage(focusEvent)
})
