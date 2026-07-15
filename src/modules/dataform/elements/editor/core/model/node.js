import { Fragment } from './fragment.js'
import { Mark } from './mark.js'

// A Node is an immutable node in the document tree. Block nodes carry a
// `content` Fragment; text nodes carry a `text` string and a set of `marks`.
//
// Positions use the ProseMirror-style flat coordinate system:
//   - a text node of length L occupies L positions,
//   - a leaf node (e.g. hard_break) occupies 1 position,
//   - a non-leaf node occupies content.size + 2 (its open + close tokens).

export class Node {
  constructor(type, attrs, content, marks = Mark.none) {
    this.type = type // NodeType
    this.attrs = attrs
    this.content = content || Fragment.empty
    this.marks = marks
    this.text = null
  }

  get nodeSize() {
    if (this.isText) return this.text.length
    if (this.isLeaf) return 1
    return this.content.size + 2
  }

  get childCount() {
    return this.content.childCount
  }

  child(i) {
    return this.content.child(i)
  }

  get isText() {
    return this.type.isText
  }
  get isLeaf() {
    return this.type.isLeaf
  }
  get isBlock() {
    return this.type.isBlock
  }
  get isInline() {
    return this.type.isInline
  }
  get isTextblock() {
    return this.type.isTextblock
  }

  get textContent() {
    if (this.isText) return this.text
    let str = ''
    this.content.forEach((child) => {
      str += child.textContent
    })
    return str
  }

  // Return a copy of this node with different content (same type/attrs/marks).
  copy(content = null) {
    if (content === this.content) return this
    return new Node(this.type, this.attrs, content || Fragment.empty, this.marks)
  }

  // Whether the (inline) mark set is allowed on this node's type. Used by editing
  // commands; for text nodes this is the interesting case.
  markAllowed(markType) {
    return this.type.allowsMarkType(markType)
  }

  eq(other) {
    return this === other || (this.sameMarkup(other) && contentEq(this.content, other.content))
  }

  sameMarkup(other) {
    return (
      this.type === other.type &&
      shallowEqual(this.attrs, other.attrs) &&
      Mark.sameSet(this.marks, other.marks)
    )
  }

  toJSON() {
    const json = { type: this.type.name }
    if (this.attrs && Object.keys(this.attrs).length) json.attrs = this.attrs
    if (this.content.size) json.content = this.content.toJSON()
    if (this.marks.length) json.marks = this.marks.map((m) => m.toJSON())
    return json
  }

  static fromJSON(schema, json) {
    if (json.type === 'text') {
      return schema.text(json.text, marksFromJSON(schema, json.marks))
    }
    const content = (json.content || []).map((c) => Node.fromJSON(schema, c))
    return schema.node(json.type, json.attrs, content, marksFromJSON(schema, json.marks))
  }
}

// Text nodes are their own subclass so text-specific slicing/marking stays tidy.
export class TextNode extends Node {
  constructor(type, attrs, text, marks) {
    super(type, attrs, null, marks)
    if (!text) throw new RangeError('Empty text nodes are not allowed')
    this.text = text
  }

  get nodeSize() {
    return this.text.length
  }

  get textContent() {
    return this.text
  }

  withText(text) {
    if (text === this.text) return this
    return new TextNode(this.type, this.attrs, text, this.marks)
  }

  // Slice the text between the given character offsets.
  cut(from = 0, to = this.text.length) {
    if (from === 0 && to === this.text.length) return this
    return this.withText(this.text.slice(from, to))
  }

  mark(marks) {
    if (Mark.sameSet(marks, this.marks)) return this
    return new TextNode(this.type, this.attrs, this.text, marks)
  }

  toJSON() {
    const json = { type: 'text', text: this.text }
    if (this.marks.length) json.marks = this.marks.map((m) => m.toJSON())
    return json
  }
}

function marksFromJSON(schema, marks) {
  if (!marks) return Mark.none
  return marks.map((m) => schema.marks[m.type].create(m.attrs))
}

function contentEq(a, b) {
  if (a.childCount !== b.childCount) return false
  return a.content.every((child, i) => child.eq(b.content[i]))
}

function shallowEqual(a, b) {
  if (a === b) return true
  const ak = Object.keys(a || {})
  const bk = Object.keys(b || {})
  if (ak.length !== bk.length) return false
  return ak.every((k) => a[k] === b[k])
}
