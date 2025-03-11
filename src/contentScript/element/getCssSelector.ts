import { getCssSelector as buildCssSelector } from 'css-selector-generator'

const MAPS = new Map<HTMLElement, Map<HTMLElement, string>>()
let currentElement: null | HTMLElement = null

const MAX_SIZE = 30
let prevs: HTMLElement[] = []
const addElement = (htmlElement: HTMLElement) => {
  if (prevs.includes(htmlElement)) {
    // move it to the back
    const newPrevs = prevs.filter((prevItem) => prevItem !== htmlElement)
    newPrevs.push(htmlElement)
    prevs = newPrevs
    return { status: 'cached' as const }
  }

  let elementToRemove: HTMLElement | null = null
  prevs.push(htmlElement)
  if (prevs.length > MAX_SIZE) {
    elementToRemove = prevs.shift() ?? null
  }

  return { status: 'new' as const, elementToRemove }
}

export const startCssSelectorCache = (htmlElement: HTMLElement) => {
  const prev = addElement(htmlElement)
  currentElement = htmlElement

  if (prev.status === 'cached') {
    return
  }

  if (prev.elementToRemove) {
    MAPS.delete(prev.elementToRemove)
  }

  MAPS.set(htmlElement, new Map())
}

// having this in a wrapper beacause it is a complex operation that
// takes time
export const getCssSelector = (element: HTMLElement) => {
  const currentMap = currentElement ? MAPS.get(currentElement) : null

  if (!currentMap) {
    throw new Error('Trying to use css selector cache before creating it')
  }

  const cachedSelector = currentMap.get(element)

  if (cachedSelector) {
    return cachedSelector
  }

  const selector = buildCssSelector(element)

  currentMap.set(element, selector)

  return selector
}
