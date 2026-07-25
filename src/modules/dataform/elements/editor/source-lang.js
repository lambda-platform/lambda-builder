// HTML tokenizer for the source-code view: syntax highlighting (returns HTML
// with .ld-src--* spans) and a tag-balance linter. Pure string functions — no
// DOM — so they stay cheap enough to run on every keystroke.

const VOID_TAGS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function span(cls, text) {
    return text ? `<span class="ld-src--${cls}">${esc(text)}</span>` : '';
}

export function highlightHTML(src) {
    let out = '';
    let i = 0;
    const n = src.length;
    while (i < n) {
        if (src[i] === '<' && src.startsWith('<!--', i)) {
            const end = src.indexOf('-->', i + 4);
            const stop = end === -1 ? n : end + 3;
            out += span('cmt', src.slice(i, stop));
            i = stop;
            continue;
        }
        if (src[i] === '<' && /[a-zA-Z!/]/.test(src[i + 1] || '')) {
            const end = src.indexOf('>', i);
            const stop = end === -1 ? n : end + 1;
            out += highlightTag(src.slice(i, stop));
            i = stop;
            continue;
        }
        let next = src.indexOf('<', i + 1);
        if (next === -1) next = n;
        out += esc(src.slice(i, next));
        i = next;
    }
    return out;
}

function highlightTag(t) {
    const m = t.match(/^(<\/?)([a-zA-Z][\w-]*)([\s\S]*?)(\/?>|)$/);
    if (!m) return span('pun', t);
    return span('pun', m[1]) + span('tag', m[2]) + highlightAttrs(m[3]) + span('pun', m[4]);
}

function highlightAttrs(s) {
    let out = '';
    const re = /"[^"]*"?|'[^']*'?|=|[^\s="']+|\s+/g;
    let m;
    while ((m = re.exec(s))) {
        const tok = m[0];
        if (tok[0] === '"' || tok[0] === "'") out += span('str', tok);
        else if (tok === '=') out += span('pun', tok);
        else if (/^\s/.test(tok)) out += esc(tok);
        else out += span('atn', tok);
    }
    return out;
}

// Tag-balance lint: unmatched closing tags, tags never closed, and a tag
// bracket left hanging at the end. Returns [{line, message}] (1-based lines).
export function lintHTML(src) {
    const errors = [];
    const stack = [];
    const re = /<!--[\s\S]*?(?:-->|$)|<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)(\/?)>/g;
    let m;
    let lastIndex = 0;
    while ((m = re.exec(src))) {
        lastIndex = re.lastIndex;
        if (m[0].startsWith('<!--')) continue;
        const name = m[2].toLowerCase();
        const line = lineOf(src, m.index);
        if (m[1] === '/') {
            const top = stack[stack.length - 1];
            if (top && top.name === name) {
                stack.pop();
            } else {
                const idx = stack.map((s) => s.name).lastIndexOf(name);
                if (idx === -1) {
                    errors.push({line, message: `</${name}> has no matching opening tag`});
                } else {
                    for (let j = stack.length - 1; j > idx; j--) {
                        errors.push({
                            line,
                            message: `</${name}> closes while <${stack[j].name}> (line ${stack[j].line}) is still open`,
                        });
                    }
                    stack.length = idx;
                }
            }
        } else if (!VOID_TAGS.has(name) && m[4] !== '/') {
            stack.push({name, line});
        }
    }
    for (const s of stack) {
        errors.push({line: s.line, message: `<${s.name}> is never closed`});
    }
    // A "<tag" opened after the last complete token but never closed with ">".
    const tail = src.slice(lastIndex);
    const hang = tail.match(/<\/?[a-zA-Z][^<]*$/);
    if (hang) {
        errors.push({
            line: lineOf(src, lastIndex + hang.index),
            message: "Tag is missing its closing '>'",
        });
    }
    errors.sort((a, b) => a.line - b.line);
    return errors;
}

function lineOf(src, index) {
    let line = 1;
    for (let i = 0; i < index; i++) if (src[i] === '\n') line++;
    return line;
}
