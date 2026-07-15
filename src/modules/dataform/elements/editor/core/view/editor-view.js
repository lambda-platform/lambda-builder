import { renderSpec, renderText } from './dom-serializer.js'
import { serializeHTML } from './dom-serializer.js'
import { parseHTML } from './dom-parser.js'
import { pasteBlocks } from '../transform/list.js'
import { TextSelection } from '../state/selection.js'
import {
  deleteBackward,
  deleteForward,
  splitBlock,
  insertHardBreak,
} from '../commands/commands.js'

// The EditorView is the ONLY part of the system that touches the DOM. It renders
// the current state into a contenteditable element, maps between DOM selection
// and model positions, and turns raw input events into transactions. The model
// stays authoritative; the DOM is always reconciled to match.

export class EditorView {
  constructor(place, props) {
    this.props = props || {}
    this.state = props.state

    this.dom = document.createElement('div')
    this.dom.className = 'lambda-editor__content'
    this.dom.contentEditable = 'true'
    this.dom.spellcheck = props.spellcheck !== false
    this.dom.setAttribute('role', 'textbox')
    this.dom.setAttribute('aria-multiline', 'true')
    place.appendChild(this.dom)

    this.composing = false
    this._settingSelection = false

    this.dispatch = this.dispatch.bind(this)

    this.render()
    this.bindEvents()
  }

  // ---- rendering (model -> DOM), recursive & depth-general ----

  render() {
    this.descs = [] // leaf descriptors {dom, from, to, isText, leaf} in document order
    this.blockEls = [] // { el, contentStart, contentEnd } for each textblock
    this.domToDesc = new Map() // DOM node -> descriptor
    const fragment = document.createDocumentFragment()
    let pos = 0
    this.state.doc.content.forEach((block) => {
      fragment.appendChild(this.renderNode(block, pos))
      pos += block.nodeSize
    })
    this._settingSelection = true
    this.dom.replaceChildren(fragment)
    this._settingSelection = false
  }

  // `start` is the absolute position just before this node's open token.
  renderNode(node, start) {
    if (node.isText) {
      const { dom, textNode } = renderText(node)
      const desc = { dom: textNode, from: start, to: start + node.nodeSize, isText: true }
      this.descs.push(desc)
      this.domToDesc.set(textNode, desc)
      return dom
    }
    const { dom, contentDOM } = renderSpec(node.type.spec.toDOM(node))
    if (node.isLeaf) {
      const desc = { dom, from: start, to: start + node.nodeSize, isText: false, leaf: true }
      this.descs.push(desc)
      this.domToDesc.set(dom, desc)
      return dom
    }
    const content = contentDOM || dom
    const contentStart = start + 1
    const info = { contentStart, contentEnd: contentStart + node.content.size }
    content._pmBlock = info
    if (node.isTextblock) this.blockEls.push({ el: content, ...info })
    if (node.isTextblock && node.content.size === 0) {
      content.appendChild(document.createElement('br'))
    } else {
      let pos = contentStart
      node.content.forEach((child) => {
        content.appendChild(this.renderNode(child, pos))
        pos += child.nodeSize
      })
    }
    return dom
  }

  // ---- selection mapping (absolute model positions) ----

  modelToDOM(pos) {
    for (const d of this.descs) {
      if (pos < d.from) break // descs are in order; pos sits at a boundary
      if (pos <= d.to) {
        if (d.isText) return { node: d.dom, offset: pos - d.from }
        const parent = d.dom.parentNode
        const idx = Array.prototype.indexOf.call(parent.childNodes, d.dom)
        return { node: parent, offset: pos === d.from ? idx : idx + 1 }
      }
    }
    const el = this.textblockElAt(pos) // empty block or boundary
    if (el) return { node: el, offset: 0 }
    return { node: this.dom, offset: 0 }
  }

  textblockElAt(pos) {
    let best = null
    for (const b of this.blockEls) {
      if (b.contentStart <= pos && pos <= b.contentEnd) {
        if (!best || b.contentEnd - b.contentStart < best.contentEnd - best.contentStart) best = b
      }
    }
    return best ? best.el : null
  }

  domToModel(node, offset) {
    if (!node) return null
    if (node.nodeType === 3) {
      const desc = this.domToDesc.get(node)
      if (desc) return desc.from + Math.min(offset, desc.to - desc.from)
      const info = this.blockInfoFor(node)
      return info ? info.contentStart : null
    }
    const leaf = this.domToDesc.get(node)
    if (leaf && leaf.leaf) return leaf.from + (offset > 0 ? 1 : 0)
    const info = this.blockInfoFor(node)
    if (!info) return null
    const children = node.childNodes
    if (offset >= children.length) {
      const last = this.lastDescWithin(node)
      return last ? last.to : info.contentEnd
    }
    const first = this.firstDescWithin(children[offset])
    return first ? first.from : info.contentStart
  }

  blockInfoFor(node) {
    let el = node.nodeType === 3 ? node.parentNode : node
    while (el && el !== this.dom && !el._pmBlock) el = el.parentNode
    return el && el._pmBlock ? el._pmBlock : null
  }

  firstDescWithin(domNode) {
    for (const d of this.descs) if (d.dom === domNode || (domNode.contains && domNode.contains(d.dom))) return d
    return null
  }

  lastDescWithin(domNode) {
    let found = null
    for (const d of this.descs) if (d.dom === domNode || (domNode.contains && domNode.contains(d.dom))) found = d
    return found
  }

  syncSelectionToDOM() {
    const sel = this.state.selection
    const from = this.modelToDOM(sel.from)
    const to = this.modelToDOM(sel.to)
    if (!from || !to) return
    const domSel = window.getSelection()
    this._settingSelection = true
    try {
      const range = document.createRange()
      range.setStart(from.node, from.offset)
      range.setEnd(to.node, to.offset)
      domSel.removeAllRanges()
      domSel.addRange(range)
    } catch (e) {
      /* positions can momentarily mismatch during teardown; ignore */
    }
    this._settingSelection = false
  }

  // ---- events ----

  bindEvents() {
    this._onKeyDown = (e) => this.onKeyDown(e)
    this._onBeforeInput = (e) => this.onBeforeInput(e)
    this._onCompositionStart = () => (this.composing = true)
    this._onCompositionEnd = (e) => this.onCompositionEnd(e)
    this._onPaste = (e) => this.onPaste(e)
    this._onSelectionChange = () => this.onSelectionChange()

    this.dom.addEventListener('keydown', this._onKeyDown)
    this.dom.addEventListener('beforeinput', this._onBeforeInput)
    this.dom.addEventListener('compositionstart', this._onCompositionStart)
    this.dom.addEventListener('compositionend', this._onCompositionEnd)
    this.dom.addEventListener('paste', this._onPaste)
    document.addEventListener('selectionchange', this._onSelectionChange)
  }

  onKeyDown(event) {
    for (const plugin of this.state.plugins) {
      if (plugin.props.handleKeyDown && plugin.props.handleKeyDown(this, event)) return
    }
  }

  onBeforeInput(event) {
    if (this.composing) return
    const type = event.inputType
    const sel = this.state.selection

    if (type === 'insertText') {
      event.preventDefault()
      const text = event.data ?? ''
      if (!this.handleTextInput(sel.from, sel.to, text)) {
        this.dispatch(this.state.tr.insertText(text, sel.from, sel.to))
      }
    } else if (type === 'insertParagraph') {
      event.preventDefault()
      splitBlock(this.state, this.dispatch, this)
    } else if (type === 'insertLineBreak') {
      event.preventDefault()
      insertHardBreak(this.state, this.dispatch, this)
    } else if (type === 'deleteContentForward' || type === 'deleteWordForward') {
      event.preventDefault()
      deleteForward(this.state, this.dispatch, this)
    } else if (type && type.startsWith('delete')) {
      event.preventDefault()
      deleteBackward(this.state, this.dispatch, this)
    } else if (type === 'insertFromPaste' || type === 'insertFromDrop') {
      event.preventDefault() // handled by the paste handler
    } else {
      // Keep the model authoritative for anything we don't explicitly model.
      event.preventDefault()
    }
  }

  onCompositionEnd(event) {
    this.composing = false
    const data = event.data || ''
    const sel = this.state.selection
    // The model didn't change during composition, but the DOM did (native IME).
    // Applying the composed text as a model insert + re-render reconciles both.
    if (data) this.dispatch(this.state.tr.insertText(data, sel.from, sel.to))
    else this.render()
  }

  // Give input-rule plugins a chance to transform text as it's typed.
  handleTextInput(from, to, text) {
    for (const plugin of this.state.plugins) {
      if (plugin.props.handleTextInput && plugin.props.handleTextInput(this, from, to, text)) return true
    }
    return false
  }

  onPaste(event) {
    event.preventDefault()
    const clipboard = event.clipboardData
    if (!clipboard) return
    const html = clipboard.getData('text/html')
    if (html && html.trim()) {
      const parsed = parseHTML(this.state.schema, html)
      const blocks = parsed.content.content
      const result = pasteBlocks(this.state.doc, this.state.selection.from, this.state.selection.to, blocks)
      if (result) {
        this.dispatch(this.state.tr.setDoc(result.doc, TextSelection.create(result.doc, result.caret)))
        return
      }
    }
    const text = clipboard.getData('text/plain')
    if (text) this.insertPlainText(text)
  }

  insertPlainText(text) {
    const lines = text.split(/\r\n?|\n/)
    const paragraph = this.state.schema.nodes[this.state.schema.spec.defaultBlock || 'paragraph']
    const tr = this.state.tr
    tr.insertText(lines[0])
    for (let i = 1; i < lines.length; i++) {
      tr.splitBlock(paragraph, null)
      if (lines[i]) tr.insertText(lines[i])
    }
    this.dispatch(tr)
  }

  onSelectionChange() {
    if (this._settingSelection || this.composing) return
    const domSel = window.getSelection()
    if (!domSel || domSel.rangeCount === 0) return
    if (!this.dom.contains(domSel.anchorNode)) return
    const anchor = this.domToModel(domSel.anchorNode, domSel.anchorOffset)
    const head = this.domToModel(domSel.focusNode, domSel.focusOffset)
    if (anchor == null || head == null) return
    const cur = this.state.selection
    if (cur.anchor === anchor && cur.head === head) return
    const tr = this.state.tr.setSelection(TextSelection.create(this.state.doc, anchor, head))
    tr.setMeta('fromDOM', true)
    this.dispatch(tr)
  }

  // ---- transactions ----

  dispatch(tr) {
    const newState = this.state.apply(tr)
    if (this.props.dispatchTransaction) {
      this.props.dispatchTransaction.call(this, tr, newState)
    } else {
      this.updateState(newState, { fromDOM: !!tr.getMeta('fromDOM') })
    }
  }

  updateState(newState, opts = {}) {
    const docChanged = newState.doc !== this.state.doc
    this.state = newState
    if (docChanged) this.render()
    if (!opts.fromDOM || docChanged) this.syncSelectionToDOM()
    if (this.props.onUpdate) this.props.onUpdate(this)
  }

  // ---- public API ----

  focus() {
    this.dom.focus()
    this.syncSelectionToDOM()
  }

  getHTML() {
    return serializeHTML(this.state.schema, this.state.doc)
  }

  setHTML(html) {
    const doc = parseHTML(this.state.schema, html)
    const tr = this.state.tr.setDoc(doc, TextSelection.atEnd(doc))
    tr.setMeta('addToHistory', false)
    this.dispatch(tr)
  }

  getJSON() {
    return this.state.doc.toJSON()
  }

  destroy() {
    this.dom.removeEventListener('keydown', this._onKeyDown)
    this.dom.removeEventListener('beforeinput', this._onBeforeInput)
    this.dom.removeEventListener('compositionstart', this._onCompositionStart)
    this.dom.removeEventListener('compositionend', this._onCompositionEnd)
    this.dom.removeEventListener('paste', this._onPaste)
    document.removeEventListener('selectionchange', this._onSelectionChange)
    this.dom.remove()
  }
}
