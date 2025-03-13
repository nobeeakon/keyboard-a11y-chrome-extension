import getCssSelector from 'css-selector-generator'
import { log, type LogType } from './logger'
import { getHtmlString } from './element/getHtmlString'
import { getTagName } from './element/tagInfo'
import searchInParent from './element/searchInParent'
import { isAriaHidden, isElementHidden } from './element/elementHidden'

// NOTE: doing this to avoid depending on the browser and make it easier to test
function isSVGElement(htmlElement: HTMLElement) {
  const elementString = Object.prototype.toString.call(htmlElement)
  return elementString.startsWith('[object') && elementString.toLocaleLowerCase().includes('svg') // for example it can be '[object SVGSVGElement]'
}

// TODO complete the list here https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles#2._widget_roles

// TODO for some reason it doesn't fully recognize all the texts in https://www.amazon.com.mx/, example next slide buttons
// TODO check which aria roles hide the content, or if is only none??

function getExplicitRole(htmlElement: HTMLElement) {
  return htmlElement.getAttribute('aria-role') ?? htmlElement.getAttribute('role') ?? null
}

// TODO remove 'none' 'generic'  'presentation'
export function getRole(htmlElement: HTMLElement, logs?: LogType[]) {
  const explicitRole = getExplicitRole(htmlElement)

  const htmlRole = getImplicitRole(explicitRole, htmlElement, logs)

  return explicitRole ?? htmlRole
}

// TODO for all check permitted parents section under 'technical summary'. For example in: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th#technical_summary

/** Obtained from the technical summary of each element https://developer.mozilla.org/en-US/docs/Web/HTML/Element , e.g. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#technical_summary */
function getImplicitRole(explicitRole: string | null, htmlElement: HTMLElement, logs?: LogType[]) {
  const tagName = getTagName(htmlElement)

  const addInvalidExplicitRoleLog = () => {
    logs?.push(
      log.minor({
        issue: `<${tagName}> using an invalid 'role': ${explicitRole}`,
        htmlElement: getHtmlString(htmlElement),
        htmlElementSelector: getCssSelector(htmlElement),
        additionalInfo: [
          {
            displayText: 'Permitted ARIA roles',
            href: `https://developer.mozilla.org/en-US/docs/Web/HTML/Element/${tagName}#technical_summary`,
          },
        ],
      }),
    )
  }

  switch (tagName) {
    case 'a': {
      const hasHref = htmlElement.getAttribute('href')?.trim() != null // regardless of if is empty
      if (!explicitRole) {
        return hasHref ? 'link' : 'generic'
      }

      const validAriaRolesWhenHref = [
        'link',
        'button',
        'checkbox',
        'menuitem',
        'menuitemcheckbox',
        'menuitemradio',
        'option',
        'radio',
        'switch',
        'tab',
        'treeitem',
      ]
      const isInvalidExplicit =
        !!explicitRole && (!hasHref || !validAriaRolesWhenHref.includes(explicitRole))

      if (isInvalidExplicit) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'abbr':
      if (explicitRole) {
        addInvalidExplicitRoleLog()
      }
      return null // no corresponding role
    case 'address': {
      if (explicitRole) {
        addInvalidExplicitRoleLog()
      }

      return 'group'
    }
    case 'area': {
      if (explicitRole) {
        addInvalidExplicitRoleLog()
      }

      return htmlElement.getAttribute('href')?.trim() != null ? 'link' : 'generic' // Link only if it has an href attribute (regardless of if is empty)
    }
    case 'article': {
      if (!explicitRole) {
        return 'article'
      }

      const validAriaRoles = [
        'application',
        'document',
        'feed',
        'main',
        'none',
        'presentation',
        'region',
      ]
      if (!validAriaRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'aside': {
      if (!explicitRole) {
        return 'complementary'
      }

      const validAriaRoles = ['feed', 'none', 'note', 'presentation', 'region', 'search']
      if (!validAriaRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'audio': {
      if (!explicitRole) {
        return null
      }

      const validAriaRoles = ['application']
      if (!validAriaRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'b': {
      return !explicitRole ? 'generic' : null
    }
    case 'base': {
      if (!explicitRole) {
        return null
      }
      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'bdi': {
      return !explicitRole ? 'generic' : null
    }
    case 'bdo': {
      return !explicitRole ? 'generic' : null
    }
    case 'blockquote': {
      return !explicitRole ? 'blockquote' : null
    }
    case 'body': {
      if (!explicitRole) {
        return 'generic'
      }
      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'br': {
      if (!explicitRole) {
        return null
      }

      const validAriaRoles = ['none', 'presentation']
      if (!validAriaRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'button': {
      if (!explicitRole) {
        return 'button'
      }

      const validAriaRoles = [
        'checkbox',
        'combobox',
        'link',
        'menuitem',
        'menuitemcheckbox',
        'menuitemradio',
        'option',
        'radio',
        'switch',
        'tab',
      ]
      if (!validAriaRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'canvas': {
      return null
    }
    case 'caption': {
      if (!explicitRole) {
        return 'caption'
      }
      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'cite': {
      return null
    }
    case 'code': {
      return !explicitRole ? 'code' : null
    }
    case 'col': {
      if (!explicitRole) {
        return null
      }
      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'colgroup': {
      if (!explicitRole) {
        return null
      }
      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'data': {
      return !explicitRole ? 'generic' : null
    }
    case 'datalist': {
      if (!explicitRole) {
        return 'listbox'
      }
      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'dd': {
      if (!explicitRole) {
        return null
      }
      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'del': {
      return !explicitRole ? 'deletion' : null
    }
    case 'details': {
      if (!explicitRole) {
        return 'group'
      }
      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'dfn': {
      return !explicitRole ? 'term' : null
    }
    case 'dialog': {
      if (!explicitRole) {
        return 'dialog'
      }

      const validAriaRoles = ['alertdialog']
      if (!validAriaRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'div': {
      return !explicitRole ? 'generic' : null
    }
    case 'dl': {
      if (!explicitRole) {
        return null
      }

      const validAriaRoles = ['group', 'list', 'none', 'presentation']
      if (!validAriaRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'dt': {
      if (!explicitRole) {
        return null
      }

      const validAriaRoles = ['listitem']
      if (!validAriaRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'em': {
      return !explicitRole ? 'emphasis' : null
    }
    case 'embeded': {
      if (!explicitRole) {
        return null
      }

      const validAriaRoles = ['application', 'document', 'img', 'none', 'presentation']
      if (!validAriaRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'fencedframe': {
      if (!explicitRole) {
        return null
      }

      const validAriaRoles = ['application', 'document', 'img', 'none', 'presentation']
      if (!validAriaRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'fieldset': {
      if (!explicitRole) {
        return 'group'
      }

      const validAriaRoles = ['radiogroup', 'presentation', 'none']
      if (!validAriaRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'figcaption': {
      if (!explicitRole) {
        return null
      }

      const validAriaRoles = ['group', 'none', 'presentation']
      if (!validAriaRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'figure': {
      if (!explicitRole) {
        return 'figure'
      }

      const hasFigCaption = !!htmlElement.querySelector('figcaption')
      if (hasFigCaption) {
        // With no figcaption descendant: any, otherwise no permitted roles
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'footer': {
      if (!explicitRole) {
        return 'contentinfo' // TODO  contentinfo, or generic if a descendant of an article, aside, main, nav or section element, or an element with role=article, complementary, main, navigation or region
      }

      const validAriaRoles = ['group', 'none', 'presentation']
      if (!validAriaRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'form': {
      if (!explicitRole) {
        return 'form'
      }

      const validAriaRoles = ['search', 'none', 'presentation']
      if (!validAriaRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      if (!explicitRole) {
        return 'heading'
      }

      const validAriaRoles = ['tab', 'none', 'presentation']
      if (!validAriaRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'head': {
      if (!explicitRole) {
        return null
      }
      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'banner': {
      if (!explicitRole) {
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/header#technical_summary
        return 'banner' // TODO  banner, or generic if a descendant of an article, aside, main, nav or section element, or an element with role=article, complementary, main, navigation or region
      }

      const validAriaRoles = ['group', 'none', 'presentation']
      if (!validAriaRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'hgroup': {
      return !explicitRole ? 'group' : null
    }
    case 'hr': {
      if (!explicitRole) {
        return 'separator'
      }

      const validAriaRoles = ['none', 'presentation']
      if (!validAriaRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'html': {
      if (!explicitRole) {
        return 'document'
      }
      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'i': {
      return !explicitRole ? 'generic' : null
    }
    case 'iframe': {
      if (!explicitRole) {
        return null
      }

      const validAriaRoles = ['application', 'document', 'img', 'none', 'presentation']
      if (!validAriaRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'img': {
      const altAttribute = htmlElement.getAttribute('alt')
      if (!explicitRole) {
        return altAttribute === '' ? 'presentation' : 'img'
      }

      if (altAttribute) {
        const validAriaRoles = [
          'button',
          'checkbox',
          'link',
          'menuitem',
          'menuitemcheckbox',
          'menuitemradio',
          'option',
          'progressbar',
          'scrollbar',
          'separator',
          'slider',
          'switch',
          'tab',
          'treeitem',
        ]
        if (!validAriaRoles.includes(explicitRole)) {
          addInvalidExplicitRoleLog()
          return
        }
      }

      if (altAttribute === '') {
        const validAriaRoles = ['none', 'presentation']
        if (!validAriaRoles.includes(explicitRole)) {
          addInvalidExplicitRoleLog()
        }
        return
      }

      // with no alt attribute, no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'input': {
      const typeAttribute = htmlElement.getAttribute('type') ?? 'text' // TODO confirm that this defaults to 'text'
      const hasListAttribute = htmlElement.getAttribute('list') != null

      let implicitRole = null
      switch (typeAttribute) {
        case 'button': {
          implicitRole = 'button'

          const validAriaRoles = [
            'checkbox',
            'combobox',
            'link',
            'menuitem',
            'menuitemcheckbox',
            'menuitemradio',
            'option',
            'radio',
            'switch',
            'tab',
          ]
          if (explicitRole && !validAriaRoles.includes(explicitRole)) {
            addInvalidExplicitRoleLog()
          }
          break
        }
        case 'checkbox': {
          implicitRole = 'checkbox'
          const hasAriaPressed = htmlElement.getAttribute('aria-pressed') != null

          const validAriaRoles = ['menuitemcheckbox', 'option', 'switch']
          if (explicitRole) {
            if (
              hasAriaPressed &&
              !(validAriaRoles.includes(explicitRole) || explicitRole === 'button')
            ) {
              addInvalidExplicitRoleLog()
            } else if (!validAriaRoles.includes(explicitRole)) {
              addInvalidExplicitRoleLog()
            }
          }

          break
        }
        case 'email':
          implicitRole = hasListAttribute ? 'combobox' : 'textbox'
          break
        case 'image': {
          implicitRole = 'button'

          const validAriaRoles = [
            'link',
            'menuitem',
            'menuitemcheckbox',
            'menuitemradio',
            'radio',
            'switch',
          ]
          if (explicitRole && !validAriaRoles.includes(explicitRole)) {
            addInvalidExplicitRoleLog()
          }
          break
        }
        case 'number':
          implicitRole = 'spinbutton'
          break
        case 'radio': {
          implicitRole = 'radio'

          const validAriaRoles = ['menuitemradio']
          if (explicitRole && !validAriaRoles.includes(explicitRole)) {
            addInvalidExplicitRoleLog()
          }

          break
        }
        case 'range':
          implicitRole = 'slider'
          break
        case 'reset':
          implicitRole = 'button'
          break
        case 'search':
          implicitRole = hasListAttribute ? 'combobox' : 'searchbox'
          break
        case 'submit':
          implicitRole = 'button'
          break
        case 'text': {
          implicitRole = hasListAttribute ? 'combobox' : 'textbox'

          if (!hasListAttribute) {
            const validAriaRoles = ['combobox', 'searchbox', 'spinbutton']
            if (explicitRole && !validAriaRoles.includes(explicitRole)) {
              addInvalidExplicitRoleLog()
            }
          } else {
            // no role permitted
            addInvalidExplicitRoleLog()
          }

          break
        }

        case 'tel':
        case 'url':
          implicitRole = hasListAttribute ? 'combobox' : 'textbox'

          break
        default:
          // type=color|date|datetime-local|file|hidden|month|password|time|week: no corresponding role
          implicitRole = null
          break
      }

      const typeWithNoRolePermitted = [
        'color',
        'date',
        'datetime-local',
        'email',
        'file',
        'hidden',
        'month',
        'number',
        'password',
        'range',
        'reset',
        'search',
        'submit',
        'tel',
        'url',
        'week',
      ]
      if (explicitRole && typeWithNoRolePermitted.includes(typeAttribute)) {
        addInvalidExplicitRoleLog()
      }

      return !explicitRole ? implicitRole : null
    }
    case 'ins': {
      return !explicitRole ? 'insertion' : null
    }
    case 'kbd': {
      return null
    }
    case 'label': {
      if (!explicitRole) {
        return null
      }
      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'legend': {
      if (!explicitRole) {
        return null
      }
      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'li': {
      if (!explicitRole) {
        const isChildOfListOrMenu = !!searchInParent(
          htmlElement,
          (currentElement) => {
            const currentElementTagName = getTagName(currentElement)
            return (
              currentElementTagName === 'ul' ||
              currentElementTagName === 'ol' ||
              currentElementTagName === 'menu'
            )
          },
          1,
        )

        return isChildOfListOrMenu ? 'listitem' : null
      }

      const validRoles = [
        'menuitem',
        'menuitemcheckbox',
        'menuitemradio',
        'option',
        'none',
        'presentation',
        'radio',
        'separator',
        'tab',
        'treeitem',
      ]
      if (!validRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'link': {
      if (!explicitRole) {
        const hasHref = htmlElement.getAttribute('href') != null

        return hasHref ? 'link' : null
      }

      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'main': {
      if (!explicitRole) {
        return 'main'
      }

      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'map': {
      if (explicitRole) {
        // no role permitted
        addInvalidExplicitRoleLog()
      }

      return null
    }
    case 'mark':
      return null
    case 'menu': {
      if (!explicitRole) {
        return 'list'
      }

      const validRoles = [
        'directory',
        'group',
        'listbox',
        'menu',
        'menubar',
        'none',
        'presentation',
        'radiogroup',
        'tablist',
        'toolbar',
        'tree',
      ]
      if (!validRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'meter': {
      if (!explicitRole) {
        return 'meter'
      }

      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'nav': {
      if (!explicitRole) {
        return 'navigation'
      }

      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'noscript': {
      if (!explicitRole) {
        return null
      }

      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'object': {
      if (!explicitRole) {
        return null
      }

      const validRoles = ['application', 'document', 'img']
      if (!validRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'ol':
    case 'ul': {
      if (!explicitRole) {
        return 'list'
      }

      const validRoles = [
        'directory',
        'group',
        'listbox',
        'menu',
        'menubar',
        'none',
        'presentation',
        'radiogroup',
        'tablist',
        'toolbar',
        'tree',
      ]
      if (!validRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'optgroup': {
      if (!explicitRole) {
        const parentElement = htmlElement.parentElement
        const isParentSelect = parentElement ? getTagName(parentElement) === 'select' : false

        return isParentSelect ? 'group' : null
      }

      addInvalidExplicitRoleLog()
      break
    }
    case 'option': {
      if (!explicitRole) {
        const parentElement = htmlElement.parentElement
        const parentTagName = parentElement ? getTagName(parentElement) : null
        const isValidParent =
          parentTagName === 'select' || parentTagName === 'optgroup' || parentTagName === 'datalist'

        return isValidParent ? 'option' : null
      }

      addInvalidExplicitRoleLog()
      break
    }
    case 'output': {
      return !explicitRole ? 'status' : null
    }
    case 'p': {
      return !explicitRole ? 'paragraph' : null
    }
    case 'picture': {
      if (!explicitRole) {
        return null
      }

      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'pre': {
      return !explicitRole ? 'generic' : null
    }
    case 'progress': {
      if (!explicitRole) {
        return 'progressbar'
      }

      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'q': {
      return !explicitRole ? 'gerneric' : null
    }
    case 'rp': {
      return null
    }
    case 'rt': {
      return null
    }
    case 'ruby': {
      return null
    }
    case 's': {
      return !explicitRole ? 'deletion' : null
    }
    case 'samp': {
      return !explicitRole ? 'generic' : null
    }
    case 'script': {
      if (!explicitRole) {
        return null
      }

      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'search': {
      if (!explicitRole) {
        return 'search'
      }

      const validRoles = ['form', 'group', 'none', 'presentation', 'region', 'search']
      if (!validRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'section': {
      if (!explicitRole) {
        const ariaLabelledby = htmlElement.getAttribute('aria-labelledby')
        const labelledbyIds = ariaLabelledby ? ariaLabelledby.split(' ') : []
        const ariaLabelledbyText = labelledbyIds
          .map((labelledbyId) => {
            const currentElement = document.getElementById(labelledbyId)
            if (
              !currentElement ||
              isAriaHidden(currentElement) ||
              isElementHidden(currentElement)
            ) {
              return ''
            }

            // TODO improve this. Can I reuse the `getAriaLabelText`  funcion?
            // using `.textContent` to avoid having a recursive call on the other functions
            // it is not optimal but at least prevents the circular dependency
            return currentElement.textContent ?? ''
          })
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()

        const hasAriaLabel = !!htmlElement.getAttribute('aria-label')

        return hasAriaLabel || ariaLabelledbyText ? 'region' : 'generic'
      }

      const validRoles = [
        'alert',
        'alertdialog',
        'application',
        'banner',
        'complementary',
        'contentinfo',
        'dialog',
        'document',
        'feed',
        'log',
        'main',
        'marquee',
        'navigation',
        'none',
        'note',
        'presentation',
        'search',
        'status',
        'tabpanel',
      ]
      if (!validRoles.includes(explicitRole)) {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'select': {
      const hasMultipleAttribute = htmlElement.getAttribute('multiple') != null
      const sizeAttributeString = htmlElement.getAttribute('size')
      const sizeAttribute = sizeAttributeString != null ? parseInt(sizeAttributeString) : null
      const isSizeNullOrLessThan2 = sizeAttribute == null || sizeAttribute <= 1

      if (!explicitRole) {
        return !hasMultipleAttribute && isSizeNullOrLessThan2 ? 'combobox' : 'listbox'
      }

      if (!hasMultipleAttribute && isSizeNullOrLessThan2 && explicitRole !== 'menu') {
        addInvalidExplicitRoleLog()
      } else {
        addInvalidExplicitRoleLog()
      }

      break
    }
    case 'slot': {
      if (!explicitRole) {
        return null
      }

      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'small': {
      return !explicitRole ? 'generic' : null
    }
    case 'source': {
      if (!explicitRole) {
        return null
      }

      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'span': {
      return null
    }
    case 'strong': {
      return !explicitRole ? 'strong' : null
    }
    case 'style': {
      if (!explicitRole) {
        return null
      }

      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'sub': {
      return !explicitRole ? 'subscript' : null
    }
    case 'summary': {
      if (!explicitRole) {
        return null
      }

      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'sup': {
      return !explicitRole ? 'superscript' : null
    }
    case 'table': {
      return !explicitRole ? 'table' : null
    }
    case 'tbody': {
      return !explicitRole ? 'subscript' : null // TODO this one has permitted parents, not sure how it affects the role https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody#technical_summary
    }
    case 'td': {
      if (explicitRole) return null

      const parentTableOrGird = searchInParent(htmlElement, (currElement) => {
        return getExplicitRole(currElement) === 'grid' || getTagName(currElement) === 'table'
      })

      if (!parentTableOrGird) {
        return null
      }

      return getExplicitRole(parentTableOrGird) === 'grid' ? 'gridcell' : 'cell'
    }
    case 'template': {
      if (!explicitRole) {
        return null
      }

      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'textarea': {
      if (!explicitRole) {
        return 'textbox'
      }

      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'tfoot': {
      return !explicitRole ? 'rowgroup' : null
    }
    case 'th': {
      if (explicitRole) return null

      const parentTr = searchInParent(
        htmlElement,
        (currElement) => {
          return getTagName(currElement) === 'tr'
        },
        1,
      )
      const parentTh = searchInParent(htmlElement, (currElement) => {
        return getTagName(currElement) === 'th'
      })

      if (!parentTr) {
        return null
      }

      return parentTh ? 'columnheader' : 'rowheader'
    }
    case 'thead': {
      return !explicitRole ? 'rowgroup' : null
    }
    case 'time': {
      return !explicitRole ? 'time' : null
    }
    case 'title': {
      if (!explicitRole) {
        return null
      }

      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'tr': {
      return !explicitRole ? 'row' : null
    }
    case 'track': {
      if (!explicitRole) {
        return null
      }

      // no role permitted
      addInvalidExplicitRoleLog()
      break
    }
    case 'u': {
      return !explicitRole ? 'generic' : null
    }
    case 'var': {
      return null
    }
    case 'video': {
      if (!explicitRole) {
        return null
      }
      if (explicitRole !== 'application') {
        addInvalidExplicitRoleLog()
      }
      break
    }
    case 'wbr': {
      return null
    }
  }

  // TODO check roles for SVG elements. I need something similar to the MDN specs for HTML elements
  if (isSVGElement(htmlElement)) {
    // Check if it's an SVG element
    switch (htmlElement.tagName.toLowerCase()) {
      case 'svg':
        return 'graphics-document' // Or 'img' if it's simple
      case 'image':
        return 'img'
      case 'a': // SVG links
        return htmlElement.getAttribute('href') ? 'link' : null
      case 'g': // Grouping element
        return 'group'
      case 'path': // Most common SVG shape
      case 'circle':
      case 'rect':
      case 'ellipse':
      case 'line':
      case 'polygon':
      case 'polyline':
        return 'graphic' // General graphic role
      // Add more SVG roles as needed (e.g., for specific shapes or complex elements)
      default:
        return null // No implicit SVG role defined
    }
  }

  return null
}

export function isRolePresentation(htmlElement: HTMLElement) {
  return htmlElement.getAttribute('role') === 'presentation'
}

// TODO role generic

// taken from https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/
const rolesWithProhibitedName = [
  'caption',
  'code',
  'deletion',
  'emphasis',
  'generic',
  'insertion',
  'mark',
  'none',
  'paragraph',
  'presentation',
  'strong',
  'subscript',
  'superscript',
]

const rolesWithDoNotName = ['time', 'term', 'rowgroup', 'listitem']

// list taken from https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label#associated_roles
const mdnRolesThatDontSupportAriaLabel = [
  'code',
  'term',
  'emphasis',
  'deletion',
  'insertion',
  'mark',
  'subscript',
  'superscript',
  'time',
  'caption',
  'definition',
  'generic',
  'presentation',
  'paragraph',
  'none',
  'strong',
  'suggestion',
]
const ROLES_WITHOUT_ARIA_LABEL_SET = new Set([
  ...rolesWithProhibitedName,
  ...rolesWithDoNotName,
  ...mdnRolesThatDontSupportAriaLabel,
])
export const getIsRoleWithoutAriaLabel = (htmlElement: HTMLElement) => {
  const role = getRole(htmlElement)
  return { role, isValidToHaveAriaLabel: role != null && !ROLES_WITHOUT_ARIA_LABEL_SET.has(role) }
}
