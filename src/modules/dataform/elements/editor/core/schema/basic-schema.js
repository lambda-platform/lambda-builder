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

// Word-style text wrapping: float the image left/right so following text
// flows alongside it starting at the image top. Legacy align="left|right"
// attributes map onto the same attr.
function imageFloat(el) {
  const style = (el.style && el.style.float) || el.getAttribute('align')
  return style === 'left' || style === 'right' ? style : null
}

const FLOAT_MARGIN = { left: '4px 16px 8px 0', right: '4px 0 8px 16px' }

// Everything in the style attribute except the declarations the editor
// manages itself (width, float, and the margin it injects for floats).
// Kept verbatim in the `style` attr so hand-written CSS from the source
// view survives the parse → serialize round-trip.
function imageExtraStyle(el, float) {
  const raw = el.getAttribute('style')
  if (!raw) return null
  const kept = []
  for (const decl of raw.split(';')) {
    const idx = decl.indexOf(':')
    if (idx === -1) continue
    const prop = decl.slice(0, idx).trim().toLowerCase()
    const value = decl.slice(idx + 1).trim()
    if (!prop || !value || prop === 'width' || prop === 'float') continue
    if (prop === 'margin' && float && value === FLOAT_MARGIN[float]) continue
    kept.push(`${prop}:${value}`)
  }
  return kept.length ? kept.join(';') : null
}

// Shared by parseDOM and the UI components (context menu, resizer) so every
// path that rebuilds an image node preserves the same set of attributes.
export function imageAttrsFromDOM(el) {
  const float = imageFloat(el)
  return {
    src: el.getAttribute('src') || '',
    alt: el.getAttribute('alt') || '',
    title: el.getAttribute('title'),
    width: imageWidth(el),
    float,
    style: imageExtraStyle(el, float),
  }
}

function imageStyle(attrs) {
  const parts = []
  if (attrs.width) parts.push(`width:${attrs.width}`)
  if (attrs.float === 'left' || attrs.float === 'right') {
    parts.push(`float:${attrs.float}`)
    const hasMargin = attrs.style && /(^|;)\s*margin(-[a-z]+)?\s*:/i.test(attrs.style)
    if (!hasMargin) parts.push(`margin:${FLOAT_MARGIN[attrs.float]}`)
  }
  if (attrs.style) parts.push(attrs.style)
  return parts.length ? parts.join(';') : null
}

// Embed sizes accept bare numbers ("560" → px) or css lengths ("100%", "20em").
function cssSize(value) {
  if (value == null || value === '') return null
  return /^\d+(\.\d+)?$/.test(value) ? value + 'px' : String(value)
}

function embedSize(el, prop) {
  const style = el.style && el.style[prop]
  if (style) return style
  return el.getAttribute(prop) || null
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

    // Embedded media (YouTube, Vimeo, maps, ...): a leaf block rendered as an
    // iframe. Size lives in attrs so the insert dialog can adjust it; values
    // are bare numbers (px) or css lengths ("100%").
    embed: {
      group: 'block',
      attrs: { src: { default: '' }, width: { default: '100%' }, height: { default: '400' } },
      toDOM: (node) => [
        'iframe',
        {
          src: node.attrs.src,
          style: `width:${cssSize(node.attrs.width) || '100%'};height:${cssSize(node.attrs.height) || '400px'}`,
          frameborder: '0',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
          allowfullscreen: 'true',
        },
      ],
      parseDOM: [
        {
          tag: 'iframe[src]',
          getAttrs: (el) => ({
            src: el.getAttribute('src'),
            width: embedSize(el, 'width') || '100%',
            height: embedSize(el, 'height') || '400',
          }),
        },
      ],
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
      attrs: {
        src: { default: '' },
        alt: { default: '' },
        title: { default: null },
        width: { default: null },
        float: { default: null },
        style: { default: null },
      },
      toDOM: (node) => [
        'img',
        {
          src: node.attrs.src,
          alt: node.attrs.alt,
          title: node.attrs.title,
          style: imageStyle(node.attrs),
        },
      ],
      parseDOM: [
        {
          tag: 'img[src]',
          getAttrs: imageAttrsFromDOM,
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
