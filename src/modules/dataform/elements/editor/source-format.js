// Pretty-print editor HTML for the source-code view. Only block-level
// boundaries get newlines/indentation — inline content is left untouched so
// re-parsing (which collapses whitespace) never changes the document.

const BLOCK_TAGS = new Set([
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'div', 'figure',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
]);

export function formatHTML(html) {
    const root = document.createElement('div');
    root.innerHTML = html || '';
    const out = [];
    for (const child of Array.from(root.childNodes)) writeNode(child, 0, out);
    return out.join('\n');
}

function writeNode(node, depth, out) {
    const pad = '    '.repeat(depth);
    if (node.nodeType === 3) {
        const text = node.nodeValue.trim();
        if (text) out.push(pad + text);
        return;
    }
    if (node.nodeType !== 1) return;

    const tag = node.tagName.toLowerCase();
    if (!BLOCK_TAGS.has(tag) || !hasBlockChildren(node)) {
        out.push(pad + node.outerHTML);
        return;
    }

    const shell = node.cloneNode(false).outerHTML;
    const closer = `</${tag}>`;
    out.push(pad + shell.slice(0, shell.length - closer.length));
    for (const child of Array.from(node.childNodes)) writeNode(child, depth + 1, out);
    out.push(pad + closer);
}

function hasBlockChildren(el) {
    for (const child of Array.from(el.children)) {
        if (BLOCK_TAGS.has(child.tagName.toLowerCase())) return true;
    }
    return false;
}
