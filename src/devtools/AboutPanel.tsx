const AboutPanel = ({ backToDataPanel }: { backToDataPanel: () => void }) => (
  <div>
    <section className="section">
      <div className="container">
        <h1 className="title">Keyboard a11y</h1>
        <button onClick={backToDataPanel} className="button is-primary">
          Try it out
        </button>
        <p className="has-text-danger">
          <em>This is in pre-alpha state (active development)</em>
        </p>
        <p className="has-text-danger">Please report any bug, also happy to discuss any feature</p>
      </div>
    </section>
    <section className="section">
      <div className="container">
        <h2 className="title is-4">About the tool</h2>
        <p>Main features</p>
        <div className="content">
          <ul>
            <li>Automatic issues identification</li>
            <li>
              Allows to save items with all information and relevant data for developers like css
              selectors
            </li>
          </ul>
        </div>
      </div>
    </section>
    <section className="section">
      <div className="container">
        <h2 className="title is-4">Keyboard accessibility</h2>
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
        <h3 className="title is-5">Resources</h3>
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
          </ul>
        </div>
      </div>
    </section>
    <section className="section">
      <div className="container">
        <h2 className="title is-4">Other tools</h2>
        <p>
          No tool can evaluate all possible accessibility issues and this one is no exception.
          Please consider using other tools like:
        </p>
        <div className="content">
          <ul>
            <li>
              <a href="https://wave.webaim.org/extension/" target="_blank">
                WAVE
              </a>
              <span>: automatic accessibility evaluator. </span>
            </li>
            <li>
              <a href="https://www.deque.com/axe/devtools/" target="_blank">
                AXE
              </a>
              <span>: automatic accessibility evaluator. </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
)

export default AboutPanel
