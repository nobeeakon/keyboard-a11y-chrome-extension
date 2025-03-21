import React from 'react'
import ReactDOM from 'react-dom/client'
import { DevTools } from './DevTools'
import './index.css'
import './css/bulma.css'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <DevTools />
  </React.StrictMode>,
)

chrome.devtools.panels.create('Keyboard a11y', '', '../../devtools.html', function () {})
