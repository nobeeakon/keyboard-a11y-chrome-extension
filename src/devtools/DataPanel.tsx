import Logs from './data/Logs'
import type { FocusEvent } from '../contentScript'
import HtmlElement from './data/HtmlElement'

const DataPanel = ({
  data,
  savedData,
  savedItems,
  isProcessing,
  onSave,
  updateNote,
  onExportData,
  goToAboutPanel,
}: {
  data: FocusEvent['data']
  savedData?: { isSaved: boolean; isNotVisible: boolean; hasNoFocus: boolean; note: string }
  savedItems: number
  isProcessing: boolean
  onSave: (action: 'save' | 'notVisible' | 'noFocus') => void
  updateNote: (text: string) => void
  onExportData: () => void
  goToAboutPanel: () => void
}) => {
  const { role, tagName, text, textType, tabIndex, htmlElement, selector, logs } = data
  // TODO copy to clipboard
  // const onCssSelectorToClipboard = () => {
  //   navigator.clipboard.writeText(selector)
  //   .then(() => console.log("Copied successfully!"))
  //   .catch(err => console.error("Clipboard write failed:", err));
  // }

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

      {isProcessing && (
        <div className="has-text-centered notification is-info m-0 p-1"> Processing... </div>
      )}

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
          {!!htmlElement && (
            <li>
              <HtmlElement htmlElementString={htmlElement} selector={selector} />
            </li>
          )}
        </ul>
        {/* <div><button onClick={onCssSelectorToClipboard} className='button is-small'>Copy CSS selector</button></div> */}
      </div>
      <div className="mt-5">
        <Logs logs={logs} />
      </div>
    </div>
  )
}

export default DataPanel
