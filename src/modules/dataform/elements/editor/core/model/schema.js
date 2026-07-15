import { Node, TextNode } from './node.js'
import { Fragment } from './fragment.js'
import { Mark } from './mark.js'

// A Schema declares the node and mark types a document may contain, plus their
// DOM serialization/parsing rules. Nothing is rendered, parsed, or created
// without going through the schema, which is what makes the editor safe by
// construction (unknown tags simply have no type and are dropped on paste).

class NodeType {
  constructor(name, schema, spec) {
    this.name = name
    this.schema = schema
    this.spec = spec
    // v1 content model is intentionally simple: 'inline' | 'block' | null (leaf).
    this.contentType = spec.content || null
    this.attrsSpec = spec.attrs || {}
    this.isText = name === 'text'
    this.inline = !!spec.inline || this.isText
  }

  get isBlock() {
    return !this.inline
  }
  get isInline() {
    return this.inline
  }
  get isTextblock() {
    return this.contentType === 'inline' && !this.isText
  }
  get isLeaf() {
    return this.contentType == null && !this.isText
  }

  allowsMarkType(markType) {
    // v1: marks are allowed on any inline/textblock content. A node spec may opt
    // out with `marks: ''`.
    if (this.spec.marks === '') return false
    return true
  }

  create(attrs = null, content = null, marks = Mark.none) {
    return new Node(this, computeAttrs(this.attrsSpec, attrs), Fragment.from(content), marks)
  }

  createText(text, marks = Mark.none) {
    return new TextNode(this, computeAttrs(this.attrsSpec, null), text, marks)
  }
}

class MarkType {
  constructor(name, schema, spec) {
    this.name = name
    this.schema = schema
    this.spec = spec
    this.attrsSpec = spec.attrs || {}
    this.excludes = spec.excludes // reserved for future exclusion logic
  }

  create(attrs = null) {
    return new Mark(this, computeAttrs(this.attrsSpec, attrs))
  }
}

export class Schema {
  constructor(spec) {
    this.spec = spec
    this.nodes = {}
    this.marks = {}

    for (const name in spec.nodes) {
      this.nodes[name] = new NodeType(name, this, spec.nodes[name])
    }
    for (const name in spec.marks) {
      this.marks[name] = new MarkType(name, this, spec.marks[name])
    }

    if (!this.nodes.text) throw new RangeError("Schema is missing a 'text' node type")
    this.topNodeType = this.nodes[spec.topNode || 'doc']
    if (!this.topNodeType) throw new RangeError('Schema is missing its top node type')
  }

  node(name, attrs = null, content = null, marks = Mark.none) {
    const type = this.nodes[name]
    if (!type) throw new RangeError(`Unknown node type: ${name}`)
    return type.create(attrs, content, marks)
  }

  text(str, marks = Mark.none) {
    return this.nodes.text.createText(str, marks)
  }

  mark(name, attrs = null) {
    const type = this.marks[name]
    if (!type) throw new RangeError(`Unknown mark type: ${name}`)
    return type.create(attrs)
  }

  nodeFromJSON(json) {
    return Node.fromJSON(this, json)
  }
}

function computeAttrs(attrsSpec, provided) {
  const attrs = {}
  for (const name in attrsSpec) {
    let value = provided && name in provided ? provided[name] : undefined
    if (value === undefined) {
      const spec = attrsSpec[name]
      if (spec && 'default' in spec) value = spec.default
      else throw new RangeError(`No value supplied for required attribute '${name}'`)
    }
    attrs[name] = value
  }
  // allow extra provided attrs that aren't declared (kept as-is)
  if (provided) {
    for (const name in provided) if (!(name in attrs)) attrs[name] = provided[name]
  }
  return attrs
}

export { NodeType, MarkType }
