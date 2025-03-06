const NODE_TYPE = {
  htmlElement: 1,
  textNode: 3,
}

export function isHtmlTextNode(htmlNode: Node) {
  return htmlNode.nodeType === NODE_TYPE.textNode
}

export function isHtmlElement(htmlNode: Node): htmlNode is HTMLElement {
  return htmlNode.nodeType === NODE_TYPE.htmlElement
}
