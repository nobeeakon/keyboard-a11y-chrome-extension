import type { LogType } from '../../contentScript/logger'
import HtmlElement from './HtmlElement'

const parseKey = (keyName: string) => {
  const result: string[] = []
  for (let i = 0; i < keyName.length; i++) {
    const currChar = keyName[i]
    if (currChar === currChar.toUpperCase()) {
      result.push(' ')
    }
    result.push(i === 0 ? currChar.toUpperCase() : currChar)
  }
  return result.join('')
}

const LogData = ({ logData }: { logData: LogType['data'] }) => {
  if (!logData || Object.keys(logData).length === 0) {
    return null
  }

  const entries = Object.entries(logData).map(([keyItem, valueItem], idx) => {
    const isElement = keyItem.toLowerCase().includes('element')

    return (
      <li key={idx}>
        {parseKey(keyItem)}: {isElement ? <code>{valueItem}</code> : valueItem}
      </li>
    )
  })

  return (
    <div>
      <ul>{entries}</ul>
    </div>
  )
}

const LOG_TITLE: Record<LogType['type'], string> = {
  error: 'Error',
  warn: 'Warning',
  info: 'Info',
  minor: 'Minor issue',
}

const LOG_TYPE_TO_STYLING_MAP: Record<LogType['type'], string> = {
  error: 'is-danger',
  warn: 'is-warning',
  info: 'is-success',
  minor: 'is-info',
}

// TODO ? group logs based on the htmlElement, so to prevent to show the html + selector every time
const Logs = ({ logs }: { logs: LogType[] }) => {
  const loggedInfo = logs.map((logItem, idx) => {
    const additionalInfo = logItem?.additionalInfo ?? []
    return (
      <div key={idx} className={`notification p-2 ${LOG_TYPE_TO_STYLING_MAP[logItem.type]}`}>
        <div>
          <h4 className="has-text-centered	">
            <strong>{LOG_TITLE[logItem.type]}</strong>
          </h4>
        </div>
        {'issue' in logItem ? (
          <div>
            <span> Issue: </span>
            {logItem.issue}
          </div>
        ) : null}
        {'message' in logItem ? (
          <div>
            <span>Message: </span>
            {logItem.message}
          </div>
        ) : null}
        <div>
          <HtmlElement
            htmlElementString={logItem.htmlElement}
            selector={logItem.htmlElementSelector}
          />
        </div>
        {additionalInfo.length === 0 ? null : (
          <div>
            More info in:{' '}
            {additionalInfo.map((linkItem, idx) => (
              <span key={`additional-info-${idx}`}>
                <a href={linkItem.href} target="blank">
                  {linkItem.displayText}
                </a>
              </span>
            ))}
          </div>
        )}
        {!!logItem?.data && (
          <div className="mt-3">
            <LogData logData={logItem?.data} />
          </div>
        )}
      </div>
    )
  })

  return loggedInfo.length === 0 ? null : <div>{loggedInfo}</div>
}

export default Logs
