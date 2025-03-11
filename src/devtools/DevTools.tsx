import { useState, useRef, useEffect, useCallback } from 'react'
import { isFocusEvent, isProcessingEvent, type FocusEvent } from '../contentScript'

import NoDataPanel from './NoDataPanel'
import AboutPanel from './AboutPanel'

import './DevTools.css'
import DataPanel from './DataPanel'

type StoredData = FocusEvent['data'] & {
  hasNoFocus?: boolean
  isNotVisible?: boolean
  note?: string
}

// store info only while the dev tools are open
const getStoreSavedKey = ({ locationHref, selector }: { locationHref: string; selector: string }) =>
  `${locationHref}-${selector}`

export const DevTools = () => {
  const [currentView, setCurrentView] = useState<'noData' | 'data' | 'about'>('noData')
  const [data, setData] = useState<FocusEvent['data'] | null>(null)
  const [storedData, setStoredData] = useState<Record<string, StoredData>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const currentTabIdRef = useRef<undefined | number>()

  // add event listener tab events
  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined

    const handleMessage = (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void,
    ) => {
      if (currentTabIdRef.current == null) {
        currentTabIdRef.current = sender.tab?.id
      }
      // only process the events from the current tab
      if (currentTabIdRef.current !== sender.tab?.id) {
        return
      }

      if (isProcessingEvent(message)) {
        timeout = setTimeout(() => {
          setIsProcessing(true)
        }, 500)
      } else if (isFocusEvent(message)) {
        clearTimeout(timeout)

        setIsProcessing(false)
        setData(message.data)
      }

      // Important: Return true from the listener to indicate you wish to use sendResponse asynchronously
      return true
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
      clearTimeout(timeout)
    }
  }, [])

  const storedKey = data
    ? getStoreSavedKey({ locationHref: data.locationHref, selector: data.selector })
    : null
  const onSave = useCallback(
    (action: 'save' | 'notVisible' | 'noFocus') => {
      if (!data || !storedKey) return

      setStoredData((prev) => {
        const newData = { ...prev }
        const newItem = newData[storedKey] ? { ...newData[storedKey] } : null

        if (action === 'save') {
          if (!!newItem) {
            delete newData[storedKey]
          } else {
            newData[storedKey] = { ...data }
          }
        }

        if (action === 'noFocus') {
          if (!newItem || !newItem?.hasNoFocus) {
            newData[storedKey] = { ...(newItem ?? data), hasNoFocus: true }
          } else {
            delete newItem['hasNoFocus']
            newData[storedKey] = newItem
          }
        }

        if (action === 'notVisible') {
          if (!newItem || !newItem?.isNotVisible) {
            newData[storedKey] = { ...(newItem ?? data), isNotVisible: true }
          } else {
            delete newItem['isNotVisible']
            newData[storedKey] = newItem
          }
        }

        return newData
      })
    },
    [data, storedKey],
  )

  const updateNote = (newNote: string) => {
    if (!data || !storedKey) return

    setStoredData((prev) => {
      const newData = { ...prev }
      const newItem = newData[storedKey] ? { ...newData[storedKey] } : { ...data }

      if (newNote.trim()) {
        newItem['note'] = newNote
      } else if ('note' in newItem) {
        delete newItem.note
      }

      newData[storedKey] = newItem

      return newData
    })
  }

  const exportData = () => {
    const downloadLink = document.createElement('a')
    downloadLink.download = 'keyboard_accessibility.json'
    const blob = new Blob([JSON.stringify(storedData, null, 2)], { type: 'application/json' })

    downloadLink.href = URL.createObjectURL(blob)

    document.body.appendChild(downloadLink)
    downloadLink.click()

    downloadLink.remove()
  }

  const savedData =
    storedKey && storedData[storedKey]
      ? {
          isSaved: true,
          hasNoFocus: !!storedData[storedKey].hasNoFocus,
          isNotVisible: !!storedData[storedKey].isNotVisible,
          note: storedData[storedKey].note ?? '',
        }
      : undefined

  if (currentView === 'about') {
    return (
      <main>
        <AboutPanel backToDataPanel={() => setCurrentView(!!data ? 'data' : 'noData')} />
      </main>
    )
  }

  if (!data) {
    return (
      <main>
        <NoDataPanel goToAboutPanel={() => setCurrentView('about')} />
      </main>
    )
  }

  return (
    <main>
      <DataPanel
        savedData={savedData}
        isProcessing={isProcessing}
        updateNote={updateNote}
        savedItems={Object.keys(storedData).length}
        onSave={onSave}
        data={data}
        onExportData={exportData}
        goToAboutPanel={() => setCurrentView('about')}
      />
    </main>
  )
}

export default DevTools
