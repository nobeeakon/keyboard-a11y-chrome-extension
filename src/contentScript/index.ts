import getActiveElementInfo, { type ElementInfo } from './getActiveElementInfo.js'
import { getTagName } from './element/tagInfo.js'

const isHtmlElement = (element: Element): element is HTMLElement => element instanceof HTMLElement

const isObject = (item: unknown): item is object => {
  return item != null && typeof item === 'object'
}

const FOCUS_EVENT = 'FOCUS_EVENT' as const
export type FocusEvent = { type: typeof FOCUS_EVENT; data: ElementInfo }
export const isFocusEvent = (event: unknown): event is FocusEvent => {
  // NOTE: this is kind of a naive validation but works for the moment
  const isFocusType = isObject(event) && 'type' in event && event.type === FOCUS_EVENT
  const hasFocusData = isObject(event) && 'data' in event && isObject(event.data)

  return isFocusType && hasFocusData
}

const PROCESSING_EVENT = 'PROCESSING_EVENT' as const
type ProcessingEvent = { type: typeof PROCESSING_EVENT }
export const isProcessingEvent = (event: unknown): event is FocusEvent => {
  return isObject(event) && 'type' in event && event.type === PROCESSING_EVENT
}

let lastActive: Element | null = null

const keyUpHandler = () => {
  if (document.activeElement === lastActive) {
    return
  }

  const processingMessage: ProcessingEvent = { type: 'PROCESSING_EVENT' }
  chrome.runtime.sendMessage(processingMessage)

  lastActive = document.activeElement

  if (!lastActive || !isHtmlElement(lastActive) || getTagName(lastActive) === 'body') return

  const elementData = getActiveElementInfo(
    lastActive,
    window.location.href,
    window.getComputedStyle,
  )

  const focusEvent: FocusEvent = { type: FOCUS_EVENT, data: elementData }
  chrome.runtime.sendMessage(focusEvent)
}

document.addEventListener('keyup', keyUpHandler)
