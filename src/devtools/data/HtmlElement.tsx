import { useEffect, useState, useCallback } from 'react'

const INSPECT_FAILED_ERROR_MESSAGE = 'Failed to inspect'

const useInspect = (selector: string) => {
  const [hasFailedToInspect, setHasFailedToInspect] = useState(false)

  // update when new data comes in
  useEffect(() => {
    setHasFailedToInspect(false)
  }, [selector])

  const onInspectElement = useCallback(() => {
    setHasFailedToInspect(false)
    chrome.devtools.inspectedWindow.eval(
      `
      (function() {
        const element = document.querySelector("${selector}");
        if (element) {
          inspect(element);
          return true;
        } else {
          console.warn("Element not found.");
        return false;
        }
      })();
    `,
      (res, error) => {
        if (!res) {
          console.error(`[inspectElement] invalid css selector:  ${selector}`)
        }
        if (error) {
          console.error('[inspectElement] Something went wrong: ', error)
        }
        if (!res || error) {
          setHasFailedToInspect(true)
        }
      },
    )
  }, [selector])

  return {
    hasFailedToInspect,
    onInspectElement,
  }
}

const HtmlElement = ({
  selector,
  htmlElementString,
}: {
  selector: string
  htmlElementString: string
}) => {
  const { hasFailedToInspect, onInspectElement } = useInspect(selector)

  return (
    <>
      <span className="htmlElementContainer">
        HTML:{' '}
        <button onClick={onInspectElement} className="button is-small">
          Inspect
        </button>
      </span>{' '}
      <code>{htmlElementString}</code>
      {hasFailedToInspect && (
        <p>
          <em>{INSPECT_FAILED_ERROR_MESSAGE}</em>
        </p>
      )}
    </>
  )
}

export default HtmlElement
