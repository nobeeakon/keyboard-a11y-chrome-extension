import Logs from './Logs'
import type { FocusEvent } from '../contentScript'

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

  return (
    <div>
      <div className="dataPanelActionButtons">
        <div>
          <button className="button is-primary" onClick={goToAboutPanel}>
            About
          </button>
        </div>
        {savedItems === 0 ? null : (
          <div>
            <button className="button is-primary" onClick={onExportData}>
              Export Data ({savedItems} {savedItems === 1 ? 'item' : 'items'})
            </button>
          </div>
        )}
      </div>

      <div className='textInfo'>
          <p>
            <strong>Text: </strong> <span>{text}</span>
          </p>
          <p>
            <strong>Text type: </strong> <span>{textType}</span>
          </p>
      </div>

      <div className='savedInfo'>
        <div className="dataPanelSaveButtons">
          {/* TODO add keyboard shortcuts */}
          <label>
            <input type="checkbox" checked={!!savedData?.isSaved} onChange={() => onSave('save')} />{' '}
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
          className='note-input'
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
          <li>
            <span>HTML: </span>
            <code>{htmlElement}</code>
          </li>
          <li>
            <span>Selector: </span>
            <code>{selector}</code>
          </li>
        </ul>
      </div>
      <div>
        <Logs logs={logs} />
      </div>
    </div>
  )
}

export default DataPanel
