import { isHTMLTag } from './tagInfo'

const SEARCH_UP_TREE_MAX = 100

const searchInParent = (
  htmlElement: HTMLElement,
  callback: (htmlElement: HTMLElement) => boolean,
  levelsUp = SEARCH_UP_TREE_MAX,
) => {
  let currentElement: HTMLElement | null = htmlElement
  for (let i = 0; i < levelsUp; i++) {
    if (!currentElement || isHTMLTag(currentElement)) {
      break
    }

    if (callback(currentElement)) {
      return currentElement
    }

    currentElement = currentElement.parentElement
  }
}

export default searchInParent
