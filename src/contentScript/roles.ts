// NOTE: doing this to avoid depending on the browser and make it easier to test
function isSVGElement(htmlElement: HTMLElement) {
  return Object.prototype.toString.call(htmlElement) === '[object SVGElement]'
}

// TODO valid aria roles
// TODO validate implicit vs explicit role
// TODO complete the list here https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles#2._widget_roles
export function getRole(htmlElement: HTMLElement) {
  const explicitRole = htmlElement.getAttribute('aria-role') ?? htmlElement.getAttribute('role')

  if (explicitRole) {
    return explicitRole === 'none' ? null : explicitRole
  }

  switch (htmlElement.tagName.toLowerCase()) {
    case 'button':
      return 'button'
    case 'a':
      return htmlElement.getAttribute('href')?.trim() ? 'link' : null // Link only if it has an href
    case 'input':
      switch (htmlElement.getAttribute('type')) {
        case 'button':
        case 'submit':
        case 'reset':
          return 'button'
        case 'checkbox':
          return 'checkbox'
        case 'radio':
          return 'radio'
        case 'range':
          return 'slider'
        default:
          return 'textbox' // Most input types are treated as textboxes
      }
    case 'select':
      return 'combobox'
    case 'textarea':
      return 'textbox'
    case 'img':
      return 'img' // Or 'graphics-document' if it's more complex
    case 'form':
      return 'form'
    case 'table':
      return 'table'
    case 'th':
      return 'columnheader'
    case 'td':
      return 'cell'
    case 'thead':
      return 'rowgroup'
    case 'tbody':
      return 'rowgroup'
    case 'tfoot':
      return 'rowgroup'
    case 'tr':
      return 'row'
    case 'ul':
    case 'ol':
      return 'list'
    case 'li':
      return 'listitem'
    case 'nav':
      return 'navigation'
    case 'article':
      return 'article'
    case 'aside':
      return 'complementary'
    case 'footer':
      return 'contentinfo'
    case 'header':
      return 'banner'
    case 'main':
      return 'main'
    case 'section':
      return 'region'
    case 'iframe':
      return 'document' // Or 'application' if the iframe contains an interactive application
    case 'code':
      return 'code'
    case 'strong':
      return 'strong'
    case 'em':
      return 'emphasis'
    case 'dt':
    case 'dfn':
      return 'term'
    case 'del':
      return 'deletion'
    case 'ins':
      return 'insertion'
    case 'mark':
      return 'mark'
    case 'sub':
      return 'subscript'
    case 'sup':
      return 'superscript'
    case 'time':
      return 'time'
    case 'p':
      return 'paragraph'
    default:
      break
  }

  // 3. Handle SVG elements:
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
const rolesWithoutName = [
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

// taken from https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/
const requireAriaLabel = ['alertdialog', 'application', 'dialog', 'region']
