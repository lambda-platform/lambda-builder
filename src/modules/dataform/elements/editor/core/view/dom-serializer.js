// Turn model nodes into DOM using each type's `toDOM` spec. Used both by the
// EditorView (for rendering) and by serializeHTML (for reading content out).
//
// A toDOM spec is an array like ['p', 0] or ['a', { href }, 0], where the number
// 0 marks the "content hole" — the element children get inserted there.

export function renderSpec(spec) {
  if (typeof spec === 'string') {
    return { dom: document.createTextNode(spec), contentDOM: null }
  }
  const tag = spec[0]
  const dom = document.createElement(tag)
  let contentDOM = null
  let start = 1
  const maybeAttrs = spec[1]
  if (maybeAttrs && typeof maybeAttrs === 'object' && !Array.isArray(maybeAttrs)) {
    for (const name in maybeAttrs) {
      const value = maybeAttrs[name]
      if (value != null) dom.setAttribute(name, value)
    }
    start = 2
  }
  for (let i = start; i < spec.length; i++) {
    const child = spec[i]
    if (child === 0) {
      contentDOM = dom
    } else {
      const rendered = renderSpec(child)
      dom.appendChild(rendered.dom)
      if (rendered.contentDOM) contentDOM = rendered.contentDOM
    }
  }
  return { dom, contentDOM }
}

// Wrap a text node's DOM in its mark elements, first mark outermost.
export function renderText(node) {
  const textNode = document.createTextNode(node.text)
  let dom = textNode
  for (let i = node.marks.length - 1; i >= 0; i--) {
    const mark = node.marks[i]
    const { dom: markDOM, contentDOM } = renderSpec(mark.type.spec.toDOM(mark))
    ;(contentDOM || markDOM).appendChild(dom)
    dom = markDOM
  }
  return { dom, textNode }
}

export function serializeNode(node) {
  if (node.isText) return renderText(node).dom
  const { dom, contentDOM } = renderSpec(node.type.spec.toDOM(node))
  if (contentDOM && !node.isLeaf) {
    if (node.isTextblock && node.content.size === 0) {
      contentDOM.appendChild(document.createElement('br'))
    } else {
      node.content.forEach((child) => contentDOM.appendChild(serializeNode(child)))
    }
  }
  return dom
}

export function serializeHTML(schema, doc) {
  const container = document.createElement('div')
  doc.content.forEach((block) => container.appendChild(serializeNode(block)))
  return container.innerHTML
}
