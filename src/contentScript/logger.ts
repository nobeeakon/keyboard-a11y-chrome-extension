// TODO complete this
export const LOG_ID = {
  error: {},
  warn: {
    tabindexNonNumeric: 'tabindexNonNumeric',
    tabindexInvalid: 'tabindexNonNumeric',
  },
  info: {},
  minor: {},
} as const

type AdditionalInfo = {
  displayText: string
  href: string
}

const buildLogId = ({ htmlElement, text }: { htmlElement: string; text: string }) =>
  `${htmlElement}-${text}`

export const log = {
  error: ({
    data,
    message,
    issue,
    htmlElement,
    htmlElementSelector,
    additionalInfo,
  }: {
    data?: object
    message?: string
    issue: string
    htmlElement: string
    htmlElementSelector: string
    additionalInfo?: AdditionalInfo[]
  }) => ({
    type: 'error' as const,
    id: buildLogId({ htmlElement, text: issue }),
    htmlElement,
    htmlElementSelector,
    data,
    message,
    issue,
    additionalInfo,
  }),
  warn: ({
    data,
    message,
    issue,
    htmlElement,
    htmlElementSelector,
    additionalInfo,
  }: {
    data?: object
    message?: string
    issue: string
    htmlElement: string
    htmlElementSelector: string
    additionalInfo?: AdditionalInfo[]
  }) => ({
    type: 'warn' as const,
    id: buildLogId({ htmlElement, text: issue }),
    htmlElement,
    htmlElementSelector,
    data,
    message,
    issue,
    additionalInfo,
  }),
  info: ({
    data,
    message,
    htmlElement,
    htmlElementSelector,
    additionalInfo,
  }: {
    data?: object
    message: string
    htmlElement: string
    htmlElementSelector: string
    additionalInfo?: AdditionalInfo[]
  }) => ({
    type: 'info' as const,
    id: buildLogId({ htmlElement, text: message }),
    htmlElement,
    htmlElementSelector,
    data,
    message,
    additionalInfo,
  }),
  minor: ({
    data,
    message,
    issue,
    htmlElement,
    htmlElementSelector,
    additionalInfo,
  }: {
    data?: object
    message?: string
    issue: string
    htmlElement: string
    htmlElementSelector: string
    additionalInfo?: AdditionalInfo[]
  }) => ({
    type: 'minor' as const,
    id: buildLogId({ htmlElement, text: issue }),
    htmlElement,
    htmlElementSelector,
    data,
    message,
    issue,
    additionalInfo,
  }),
}

export type LogType = ReturnType<(typeof log)[keyof typeof log]>
