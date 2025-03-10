import { useEffect, useState } from 'react'
import Logs from './Logs'
import type { FocusEvent } from '../contentScript'

const INSPECT_FAILED_ERROR_MESSAGE = 'Failed to inspect'

const DataPanel = ({
  data,
  savedData,
  onSave,
  updateNote,
  savedItems,
  onExportData,
  goToAboutPanel,
}: {
  data: FocusEvent['data']
  savedData?: { isSaved: boolean; isNotVisible: boolean; hasNoFocus: boolean; note: string }
  savedItems: number
  onSave: (action: 'save' | 'notVisible' | 'noFocus') => void
  updateNote: (text: string) => void
  onExportData: () => void
  goToAboutPanel: () => void
}) => {
  const { role, tagName, text, textType, tabIndex, htmlElement, selector, logs } = data
  const [showFailedToInspect, setShowFailedToInspect] = useState(false)
  // TODO copy to clipboard
  // const onCssSelectorToClipboard = () => {
  //   navigator.clipboard.writeText(selector)
  //   .then(() => console.log("Copied successfully!"))
  //   .catch(err => console.error("Clipboard write failed:", err));
  // }

  // update when new data comes in
  useEffect(() => {
    setShowFailedToInspect(false)
  }, [data])

  const onInspectElement = () => {
    setShowFailedToInspect(false)
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
          setShowFailedToInspect(true)
        }
      },
    )
  }

  return (
    <div className="mainContainer">
      <div className="headerNavContainer">
        <nav className="nav">
          <button role="tab" className="tab" onClick={goToAboutPanel}>
            About
          </button>
        </nav>
        <div className="exportButtonContainer">
          {savedItems === 0 ? null : (
            <button className="button is-primary is-small" onClick={onExportData}>
              Export Data ({savedItems} {savedItems === 1 ? 'item' : 'items'})
            </button>
          )}
        </div>
      </div>

      <div className="textInfo">
        <p>
          <strong>Text: </strong> <span>{text}</span>
        </p>
        <p>
          <strong>Text type: </strong> <span>{textType}</span>
        </p>
      </div>

      <div className="savedInfo">
        <div className="dataPanelSaveButtons">
          {/* TODO add keyboard shortcuts */}
          <label>
            <input type="checkbox" checked={!!savedData?.isSaved} onChange={() => onSave('save')} />
            Save
          </label>
          <label>
            <input
              type="checkbox"
              checked={!!savedData?.isNotVisible}
              onChange={() => onSave('notVisible')}
            />
            Not visible
          </label>
          <label>
            <input
              type="checkbox"
              checked={!!savedData?.hasNoFocus}
              onChange={() => onSave('noFocus')}
            />
            No Focus
          </label>
        </div>

        <div>
          <label htmlFor="text-comment">Note</label>
          <input
            className="note-input"
            id="text-comment"
            type="text"
            value={savedData?.note ?? ''}
            onChange={(event) => updateNote(event.target.value)}
          />
        </div>
      </div>

      <div>
        {showFailedToInspect && (
          <div>
            <div>
              <p className="has-text-danger">{INSPECT_FAILED_ERROR_MESSAGE}</p>
            </div>
          </div>
        )}
        <h3>HTML element info</h3>
        <ul>
          <li>
            <span>Role: </span>
            <span>{role ?? 'none'}</span>
          </li>
          <li>
            <span>Tag name: </span>
            <span>{tagName}</span>
          </li>

          {tabIndex == null ? null : (
            <li>
              <span>tabIndex: </span>
              <span>{tabIndex}</span>
            </li>
          )}
          <li>
            <span>
              HTML:{' '}
              <button onClick={onInspectElement} className="button is-small">
                Inspect
              </button>{' '}
            </span>
            <code>{htmlElement}</code>
          </li>
        </ul>
        {/* <div><button onClick={onCssSelectorToClipboard} className='button is-small'>Copy CSS selector</button></div> */}
      </div>
      <div>
        <Logs logs={logs} />
      </div>
    </div>
  )
}

export default DataPanel
