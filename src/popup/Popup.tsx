const GITHUB_PAGE = 'https://github.com/nobeeakon/keyboard-a11y-chrome-extension'

import './Popup.css'

const Popup = () => {
  return (
    <main>
      <h3 className="header">Keyboard Accessibility</h3>

      <div>
        <p>
          Please <em>Open the devtools</em>
        </p>
        <ul>
          <li>Go to the menu: More tools/Developer Tools</li>
          <li>or press: ⌥⌘I (on Mac), Control+Shift+C (Windows, Linux)</li>
        </ul>
        <p>Then navigate to the "Keyboard a11y" tab.</p>
      </div>

      <p>
        Feel free to{' '}
        <a href="https://x.com/nobeeakon" target="_blank" rel="noreferrer noopener">
          reach out
        </a>
        , or{' '}
        <a href={GITHUB_PAGE} target="_blank" rel="noreferrer noopener">
          contribute
        </a>
      </p>
    </main>
  )
}

export default Popup
