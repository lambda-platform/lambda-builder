// General position resolution for the nested document model. Given an absolute
// position, resolve() walks the tree recording the path of ancestors, so any
// layer can ask "which node/offset/depth is this position in?" at arbitrary
// nesting depth. This supersedes the flat `locate` helper for nested content.

export class ResolvedPos {
  constructor(pos, path, parentOffset) {
    this.pos = pos
    // path[d] = { node, index, start } for each depth d (0 = doc).
    //   node  : the node at depth d
    //   index : the child index within node that contains `pos`
    //   start : absolute position where node's content begins
    this.path = path
    this.depth = path.length - 1
    this.parentOffset = parentOffset // offset of pos within parent's content
  }

  node(d = this.depth) {
    return this.path[d].node
  }
  index(d = this.depth) {
    return this.path[d].index
  }
  start(d = this.depth) {
    return this.path[d].start
  }
  get parent() {
    return this.node(this.depth)
  }

  // Position just before the open token of the node at depth d (d >= 1).
  before(d) {
    if (d < 1) throw new RangeError('There is no position before the top node')
    return this.start(d) - 1
  }
  // Position just after the close token of the node at depth d (d >= 1).
  after(d) {
    if (d < 1) throw new RangeError('There is no position after the top node')
    return this.start(d) - 1 + this.node(d).nodeSize
  }
  // End of the content of the node at depth d.
  end(d = this.depth) {
    return this.start(d) + this.node(d).content.size
  }

  // Deepest ancestor depth whose node has the given type name, or -1.
  depthOfType(typeName) {
    for (let d = this.depth; d >= 0; d--) if (this.node(d).type.name === typeName) return d
    return -1
  }
}

export function resolve(doc, pos) {
  if (pos < 0 || pos > doc.content.size) {
    throw new RangeError(`Position ${pos} out of range (0..${doc.content.size})`)
  }
  const path = []
  let node = doc
  let start = 0
  for (;;) {
    const { index, offset } = node.content.findIndex(pos - start)
    const rem = pos - start - offset
    path.push({ node, index, start })
    const child = node.content.maybeChild(index)
    if (rem === 0 || !child || child.isText || child.isLeaf) {
      return new ResolvedPos(pos, path, pos - start)
    }
    start += offset + 1
    node = child
  }
}

// The deepest depth at which two resolved positions share the same ancestor node.
export function sharedDepth($a, $b) {
  let d = 0
  const max = Math.min($a.depth, $b.depth)
  while (d < max && $a.node(d + 1) === $b.node(d + 1)) d++
  return d
}
