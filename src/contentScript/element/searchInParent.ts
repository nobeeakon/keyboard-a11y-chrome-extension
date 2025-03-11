import { isHTMLTag } from './tagInfo'

const SEARCH_UP_TREE_MAX = 100

const searchInParent = (
  htmlElement: HTMLElement,
  callback: (htmlElement: HTMLElement) => boolean,
) => {
  let currentElement: HTMLElement | null = htmlElement
  for (let i = 0; i < SEARCH_UP_TREE_MAX; i++) {
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
