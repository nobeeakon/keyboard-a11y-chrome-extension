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

export const log = {
  error: ({
    id,
    data,
    message,
    issue,
    additionalInfo,
  }: {
    id?: string
    data: object
    message?: string
    issue: string
    additionalInfo?: AdditionalInfo[]
  }) => ({
    type: 'error' as const,
    id,
    data,
    message,
    issue,
    additionalInfo,
  }),
  warn: ({
    id,
    data,
    message,
    issue,
    additionalInfo,
  }: {
    id?: string
    data: object
    message?: string
    issue: string
    additionalInfo?: AdditionalInfo[]
  }) => ({
    type: 'warn' as const,
    id,
    data,
    message,
    issue,
    additionalInfo,
  }),
  info: ({
    id,
    data,
    message,
    additionalInfo,
  }: {
    id?: string
    data?: object
    message?: string
    additionalInfo?: AdditionalInfo[]
  }) => ({
    type: 'info' as const,
    id,
    data,
    message,
    additionalInfo,
  }),
  minor: ({
    id,
    data,
    message,
    issue,
    additionalInfo,
  }: {
    id?: string
    data: object
    message?: string
    issue: string
    additionalInfo?: AdditionalInfo[]
  }) => ({
    type: 'minor' as const,
    id,
    data,
    message,
    issue,
    additionalInfo,
  }),
}

export type LogType = ReturnType<(typeof log)[keyof typeof log]>
