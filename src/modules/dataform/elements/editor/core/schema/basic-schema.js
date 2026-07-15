import { Schema } from '../model/schema.js'

// The default document schema. v1 keeps a "flat" block model (every block is a
// direct child of the doc and holds inline content) — this covers paragraphs,
// headings, and a single-level blockquote. Nested containers (lists, real
// multi-paragraph blockquote, tables) come in a later phase.

// Build a block toDOM spec, adding text-align/line-height styling when set.
function blockDOM(tag, node) {
  const attrs = {}
  const style = []
  if (node.attrs.align) style.push(`text-align:${node.attrs.align}`)
  if (node.attrs.lineHeight) style.push(`line-height:${node.attrs.lineHeight}`)
  if (style.length) attrs.style = style.join(';')
  return [tag, attrs, 0]
}

function alignAttr(el) {
  const align = el.style && el.style.textAlign
  return align && ['left', 'center', 'right', 'justify'].includes(align) ? align : null
}

function lineHeightAttr(el) {
  const lh = el.style && el.style.lineHeight
  return lh || null
}

function parseCellSpans(el) {
  return {
    colspan: Math.max(1, parseInt(el.getAttribute('colspan'), 10) || 1),
    rowspan: Math.max(1, parseInt(el.getAttribute('rowspan'), 10) || 1),
    background: (el.style && el.style.backgroundColor) || el.getAttribute('bgcolor') || null,
  }
}

function cellSpanAttrs(node) {
  const attrs = {}
  if (node.attrs.colspan > 1) attrs.colspan = node.attrs.colspan
  if (node.attrs.rowspan > 1) attrs.rowspan = node.attrs.rowspan
  if (node.attrs.background) attrs.style = `background-color:${node.attrs.background}`
  return attrs
}

// Image width comes from inline style ("50%", "320px") or a bare width
// attribute (normalized to px).
function imageWidth(el) {
  const style = el.style && el.style.width
  if (style) return style
  const attr = el.getAttribute('width')
  if (!attr) return null
  return /^\d+(\.\d+)?$/.test(attr) ? attr + 'px' : attr
}

export const basicSchema = new Schema({
  topNode: 'doc',
  defaultBlock: 'paragraph',
  nodes: {
    doc: { content: 'block' },

    paragraph: {
      content: 'inline',
      group: 'block',
      attrs: { align: { default: null }, lineHeight: { default: null } },
      toDOM: (node) => blockDOM('p', node),
      parseDOM: [{ tag: 'p', getAttrs: (el) => ({ align: alignAttr(el), lineHeight: lineHeightAttr(el) }) }],
    },

    heading: {
      content: 'inline',
      group: 'block',
      attrs: { level: { default: 1 }, align: { default: null }, lineHeight: { default: null } },
      toDOM: (node) => blockDOM(`h${node.attrs.level}`, node),
      parseDOM: [1, 2, 3, 4, 5, 6].map((level) => ({
        tag: `h${level}`,
        getAttrs: (el) => ({ level, align: alignAttr(el), lineHeight: lineHeightAttr(el) }),
      })),
    },

    // A real container: holds one or more block children (multi-paragraph quotes).
    blockquote: {
      content: 'block',
      group: 'block',
      toDOM: () => ['blockquote', 0],
      parseDOM: [{ tag: 'blockquote' }],
    },

    horizontal_rule: {
      group: 'block',
      toDOM: () => ['hr'],
      parseDOM: [{ tag: 'hr' }],
    },

    table: {
      content: 'table_row',
      group: 'block',
      toDOM: () => ['table', ['tbody', 0]],
      parseDOM: [{ tag: 'table' }],
    },
    table_row: {
      content: 'table_cell',
      toDOM: () => ['tr', 0],
      parseDOM: [{ tag: 'tr' }],
    },
    table_cell: {
      content: 'block',
      attrs: { colspan: { default: 1 }, rowspan: { default: 1 }, background: { default: null } },
      toDOM: (node) => ['td', cellSpanAttrs(node), 0],
      parseDOM: [
        { tag: 'td', getAttrs: parseCellSpans },
        { tag: 'th', getAttrs: parseCellSpans },
      ],
    },

    bullet_list: {
      content: 'list_item',
      group: 'block',
      toDOM: () => ['ul', 0],
      parseDOM: [{ tag: 'ul' }],
    },
    ordered_list: {
      content: 'list_item',
      group: 'block',
      attrs: { start: { default: 1 } },
      toDOM: (node) => (node.attrs.start === 1 ? ['ol', 0] : ['ol', { start: node.attrs.start }, 0]),
      parseDOM: [{ tag: 'ol', getAttrs: (el) => ({ start: +el.getAttribute('start') || 1 }) }],
    },
    list_item: {
      content: 'block',
      toDOM: () => ['li', 0],
      parseDOM: [{ tag: 'li' }],
    },

    image: {
      inline: true,
      group: 'inline',
      attrs: { src: { default: '' }, alt: { default: '' }, title: { default: null }, width: { default: null } },
      toDOM: (node) => [
        'img',
        {
          src: node.attrs.src,
          alt: node.attrs.alt,
          title: node.attrs.title,
          style: node.attrs.width ? `width:${node.attrs.width}` : null,
        },
      ],
      parseDOM: [
        {
          tag: 'img[src]',
          getAttrs: (el) => ({
            src: el.getAttribute('src'),
            alt: el.getAttribute('alt') || '',
            title: el.getAttribute('title'),
            width: imageWidth(el),
          }),
        },
      ],
    },

    hard_break: {
      inline: true,
      group: 'inline',
      toDOM: () => ['br'],
      parseDOM: [{ tag: 'br' }],
    },

    text: { group: 'inline' },
  },

  marks: {
    strong: { toDOM: () => ['strong', 0], parseDOM: [{ tag: 'strong' }, { tag: 'b' }] },
    em: { toDOM: () => ['em', 0], parseDOM: [{ tag: 'em' }, { tag: 'i' }] },
    underline: { toDOM: () => ['u', 0], parseDOM: [{ tag: 'u' }] },
    strikethrough: {
      toDOM: () => ['s', 0],
      parseDOM: [{ tag: 's' }, { tag: 'del' }, { tag: 'strike' }],
    },
    subscript: {
      excludes: ['superscript'],
      toDOM: () => ['sub', 0],
      parseDOM: [{ tag: 'sub' }],
    },
    superscript: {
      excludes: ['subscript'],
      toDOM: () => ['sup', 0],
      parseDOM: [{ tag: 'sup' }],
    },
    code: { toDOM: () => ['code', 0], parseDOM: [{ tag: 'code' }] },

    textColor: {
      attrs: { color: { default: null } },
      toDOM: (mark) => ['span', { style: `color:${mark.attrs.color}` }, 0],
      parseDOM: [{ tag: 'span', getAttrs: (el) => (el.style.color ? { color: el.style.color } : false) }],
    },
    backgroundColor: {
      attrs: { color: { default: null } },
      toDOM: (mark) => ['span', { style: `background-color:${mark.attrs.color}` }, 0],
      parseDOM: [
        { tag: 'span', getAttrs: (el) => (el.style.backgroundColor ? { color: el.style.backgroundColor } : false) },
      ],
    },
    fontSize: {
      attrs: { size: { default: null } },
      toDOM: (mark) => ['span', { style: `font-size:${mark.attrs.size}` }, 0],
      parseDOM: [{ tag: 'span', getAttrs: (el) => (el.style.fontSize ? { size: el.style.fontSize } : false) }],
    },
    fontFamily: {
      attrs: { family: { default: null } },
      toDOM: (mark) => ['span', { style: `font-family:${mark.attrs.family}` }, 0],
      parseDOM: [{ tag: 'span', getAttrs: (el) => (el.style.fontFamily ? { family: el.style.fontFamily } : false) }],
    },

    link: {
      attrs: { href: { default: null }, title: { default: null } },
      toDOM: (mark) => ['a', { href: mark.attrs.href, title: mark.attrs.title, rel: 'noopener nofollow' }, 0],
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs: (el) => ({ href: el.getAttribute('href'), title: el.getAttribute('title') }),
        },
      ],
    },
  },
})
