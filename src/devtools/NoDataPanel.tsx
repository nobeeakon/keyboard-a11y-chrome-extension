const NoDataPanel = ({ goToAboutPanel }: { goToAboutPanel: () => void }) => (
  <div className="mainContainer">
    <nav className="nav">
      <button role="tab" className="tab" onClick={goToAboutPanel}>
        About
      </button>
    </nav>
    <h1 className="title">Keyboard a11y</h1>
    <section>
      <p className="mainText  has-text-info">
        <em>Please start navigating the site using the keyboard (eg. Tabs key)</em>
      </p>
    </section>

    <section className="section">
      <div className="container">
        <p>What to consider when doing keyboard testing?</p>
        <div className="content">
          <ol>
            <li>
              The element is visible and has a focus indicator (outline, underlined, color change,
              etc.)
            </li>
            <li>All controls are accessible via keyboard navigation</li>
            <li>The text is relevant and useful</li>
            <li>The navigation order make sense</li>
          </ol>
        </div>
        <p>Resources</p>
        <div className="content">
          <ul>
            <li>
              <a href="https://www.epicweb.dev/testing-accessibility-with-keyboard" target="_blank">
                Testing Accessibility with the Keyboard
              </a>
            </li>
            <li>
              <a href="https://webaim.org/techniques/keyboard/#testing" target="_blank">
                WEBAIM keyboard accessibility
              </a>
            </li>
            <li>
              <a href="https://www.a11yproject.com/checklist/#keyboard" target="_blank">
                a11y project checklist
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
)

export default NoDataPanel
