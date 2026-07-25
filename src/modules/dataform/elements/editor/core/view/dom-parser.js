import { normalizeInline } from '../transform/inline.js'

// Parse an HTML string into a model document using the schema's parseDOM rules.
// Anything the schema doesn't recognize is dropped (block wrappers become
// paragraphs, unknown inline tags are unwrapped) — this is the sanitizer.

export function parseHTML(schema, html) {
  const container =
    typeof html === 'string' ? htmlToElement(html) : html /* allow a DOM node */
  const blocks = []
  parseBlocks(schema, container, blocks)
  if (!blocks.length) blocks.push(schema.node(schema.spec.defaultBlock || 'paragraph'))
  return schema.node('doc', null, blocks)
}

function htmlToElement(html) {
  const el = document.createElement('div')
  el.innerHTML = html
  // Pasted documents can carry <style> blocks whose css text would otherwise
  // leak into the content as plain text.
  el.querySelectorAll('style, script, meta, link, title').forEach((junk) => junk.remove())
  return el
}

function parseBlocks(schema, dom, blocks) {
  let inlineBuffer = []
  const flush = () => {
    const norm = normalizeInline(inlineBuffer)
    if (norm.length) blocks.push(schema.node(schema.spec.defaultBlock || 'paragraph', null, norm))
    inlineBuffer = []
  }

  for (const child of Array.from(dom.childNodes)) {
    if (child.nodeType === 3) {
      const text = collapseWS(child.nodeValue)
      if (text.trim()) inlineBuffer.push(schema.text(text, []))
      continue
    }
    if (child.nodeType !== 1) continue

    const blockRule = matchBlock(schema, child)
    const leafBlock = matchLeafBlock(schema, child)
    if (isList(child) && schema.nodes.bullet_list) {
      flush()
      blocks.push(parseList(schema, child))
    } else if (isTag(child, 'blockquote') && schema.nodes.blockquote) {
      flush()
      blocks.push(parseBlockquote(schema, child))
    } else if (isTag(child, 'table') && schema.nodes.table) {
      flush()
      blocks.push(parseTable(schema, child))
    } else if (leafBlock) {
      flush()
      blocks.push(leafBlock)
    } else if (blockRule) {
      flush()
      const attrs = blockRule.getAttrs ? blockRule.getAttrs(child) : blockRule.attrs || null
      const inline = []
      parseInline(schema, child, [], inline)
      blocks.push(schema.node(blockRule.node, attrs, normalizeInline(inline)))
    } else if (isBR(child)) {
      if (schema.nodes.hard_break) inlineBuffer.push(schema.nodes.hard_break.create())
    } else {
      // Unknown/inline element at the block level: parse its inline content.
      parseInline(schema, child, [], inlineBuffer)
    }
  }
  flush()
}

function parseInline(schema, el, marks, out) {
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === 3) {
      const text = collapseWS(child.nodeValue)
      if (text) out.push(schema.text(text, marks))
    } else if (child.nodeType === 1) {
      if (isBR(child)) {
        if (schema.nodes.hard_break) out.push(schema.nodes.hard_break.create())
        continue
      }
      const leaf = matchInlineLeaf(schema, child)
      if (leaf) {
        out.push(leaf)
        continue
      }
      let childMarks = marks
      for (const mark of matchMarks(schema, child)) childMarks = mark.addToSet(childMarks)
      parseInline(schema, child, childMarks, out)
    }
  }
}

function matchInlineLeaf(schema, el) {
  for (const name in schema.nodes) {
    const type = schema.nodes[name]
    if (!type.isInline || !type.isLeaf) continue
    for (const rule of type.spec.parseDOM || []) {
      if (tagMatches(rule.tag, el)) {
        const attrs = rule.getAttrs ? rule.getAttrs(el) : rule.attrs || null
        if (attrs === false) continue
        return type.create(attrs)
      }
    }
  }
  return null
}

function isList(el) {
  const tag = el.tagName && el.tagName.toLowerCase()
  return tag === 'ul' || tag === 'ol'
}

function isTag(el, name) {
  return el.tagName && el.tagName.toLowerCase() === name
}

function matchLeafBlock(schema, el) {
  for (const name in schema.nodes) {
    const type = schema.nodes[name]
    if (!type.isBlock || !type.isLeaf) continue
    for (const rule of type.spec.parseDOM || []) {
      if (tagMatches(rule.tag, el)) {
        const attrs = rule.getAttrs ? rule.getAttrs(el) : rule.attrs || null
        if (attrs === false) continue
        return type.create(attrs)
      }
    }
  }
  return null
}

function parseBlockquote(schema, el) {
  const blocks = []
  parseBlocks(schema, el, blocks)
  if (!blocks.length) blocks.push(schema.node('paragraph'))
  return schema.nodes.blockquote.create(null, blocks)
}

function parseTable(schema, el) {
  const rows = []
  const trs = el.querySelectorAll ? el.querySelectorAll('tr') : []
  for (const tr of Array.from(trs)) {
    const cells = []
    for (const td of Array.from(tr.children)) {
      if (!td.tagName || !/^(td|th)$/i.test(td.tagName)) continue
      const cellBlocks = []
      parseBlocks(schema, td, cellBlocks)
      if (!cellBlocks.length) cellBlocks.push(schema.node('paragraph'))
      const attrs = {
        colspan: Math.max(1, parseInt(td.getAttribute('colspan'), 10) || 1),
        rowspan: Math.max(1, parseInt(td.getAttribute('rowspan'), 10) || 1),
        background: (td.style && td.style.backgroundColor) || td.getAttribute('bgcolor') || null,
      }
      cells.push(schema.nodes.table_cell.create(attrs, cellBlocks))
    }
    if (cells.length) rows.push(schema.nodes.table_row.create(null, cells))
  }
  if (!rows.length) return schema.node('paragraph')
  return schema.nodes.table.create(null, rows)
}

function parseList(schema, el) {
  const ordered = el.tagName.toLowerCase() === 'ol'
  const type = ordered ? schema.nodes.ordered_list : schema.nodes.bullet_list
  const items = []
  for (const li of Array.from(el.children)) {
    if (!li.tagName || li.tagName.toLowerCase() !== 'li') continue
    const itemBlocks = []
    parseBlocks(schema, li, itemBlocks)
    if (!itemBlocks.length) itemBlocks.push(schema.node('paragraph'))
    items.push(schema.node('list_item', null, itemBlocks))
  }
  if (!items.length) return schema.node('paragraph')
  const attrs = ordered ? { start: +el.getAttribute('start') || 1 } : null
  return type.create(attrs, items)
}

function matchBlock(schema, el) {
  for (const name in schema.nodes) {
    const type = schema.nodes[name]
    if (!type.isTextblock) continue
    for (const rule of type.spec.parseDOM || []) {
      if (tagMatches(rule.tag, el)) {
        return { node: name, getAttrs: rule.getAttrs, attrs: rule.attrs }
      }
    }
  }
  return null
}

// Collect every mark an element carries — one span from Word can hold color,
// font, size, and weight all at once, so a single-match walk loses styles.
function matchMarks(schema, el) {
  const marks = []
  for (const name in schema.marks) {
    const type = schema.marks[name]
    for (const rule of type.spec.parseDOM || []) {
      if (tagMatches(rule.tag, el)) {
        const attrs = rule.getAttrs ? rule.getAttrs(el) : null
        if (attrs === false) continue
        marks.push(type.create(attrs))
        break
      }
    }
  }
  // Style-driven marks (Word expresses bold/italic/underline via css too).
  const style = el.style
  if (style) {
    const has = (name) => marks.some((m) => schema.marks[name] && m.type === schema.marks[name])
    const weight = style.fontWeight
    if (schema.marks.strong && !has('strong') && (weight === 'bold' || weight === 'bolder' || parseInt(weight, 10) >= 600)) {
      marks.push(schema.marks.strong.create())
    }
    if (schema.marks.em && !has('em') && (style.fontStyle === 'italic' || style.fontStyle === 'oblique')) {
      marks.push(schema.marks.em.create())
    }
    const deco = `${style.textDecoration || ''} ${style.textDecorationLine || ''}`
    if (schema.marks.underline && !has('underline') && deco.includes('underline')) {
      marks.push(schema.marks.underline.create())
    }
    if (schema.marks.strikethrough && !has('strikethrough') && deco.includes('line-through')) {
      marks.push(schema.marks.strikethrough.create())
    }
  }
  return marks
}

// Support 'tag' and 'tag[attr]' selectors.
function tagMatches(selector, el) {
  if (!selector) return false
  const match = /^([a-z0-9]+)(?:\[([a-z-]+)\])?$/i.exec(selector)
  if (!match) return false
  const [, tag, attr] = match
  if (el.tagName.toLowerCase() !== tag.toLowerCase()) return false
  if (attr && !el.hasAttribute(attr)) return false
  return true
}

function isBR(el) {
  return el.nodeType === 1 && el.tagName.toLowerCase() === 'br'
}

function collapseWS(text) {
  // Collapse only ASCII whitespace runs (HTML rendering semantics), then turn
  // &nbsp; into plain spaces — the model works with regular spaces and the
  // serializer re-emits nbsp where a browser would otherwise collapse them.
  return text.replace(/[ \t\r\n\f]+/g, ' ').replace(/\u00a0/g, ' ')
}
