import type { LogType } from '../contentScript/logger'

const LogData = ({ logData }: { logData: LogType['data'] }) => {
  if (!logData || Object.keys(logData).length === 0) {
    return null
  }

  const entries = Object.entries(logData).map(([keyItem, valueItem], idx) => {
    const isElement = keyItem.toLowerCase().includes('element')

    return (
      <li key={idx}>
        <b>{keyItem} </b>:{isElement ? <code>{valueItem}</code> : valueItem}
      </li>
    )
  })

  return (
    <div>
      <ul>{entries}</ul>
    </div>
  )
}

const EMOJI: Record<LogType['type'], string> = {
  error: '🚨',
  warn: '⚠️',
  info: 'ℹ️',
  minor: '📟',
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

const LogTitle = ({ logType }: { logType: LogType['type'] }) => (
  <div>
    <h4>
      <span aria-hidden>{EMOJI[logType]} </span>
      <span>{LOG_TITLE[logType]}</span>
    </h4>
  </div>
)

const Logs = ({ logs }: { logs: LogType[] }) => {
  const loggedInfo = logs.map((logItem, idx) => {
    const additionalInfo = logItem?.additionalInfo ?? []
    return (
      <div key={idx} className={`notification ${LOG_TYPE_TO_STYLING_MAP[logItem.type]}`}>
        <LogTitle logType={logItem.type} />
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
        {additionalInfo.length === 0 ? null : (
          <div>
            More info in:
            {additionalInfo.map((linkItem, idx) => (
              <span key={`additional-info-${idx}`}>
                <a href={linkItem.href} target="blank">
                  {linkItem.displayText}
                </a>
              </span>
            ))}
          </div>
        )}
        <LogData logData={logItem?.data} />
      </div>
    )
  })

  return loggedInfo.length === 0 ? null : <div>{loggedInfo}</div>
}

export default Logs
