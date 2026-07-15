// Cleanup for HTML copied out of Microsoft Word: extract the body fragment,
// strip non-content elements, unwrap section divs, and rebuild mso-list
// paragraphs into real ul/ol lists so the editor parser keeps the structure.

export function cleanWordHTML(html) {
    const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html);
    const container = document.createElement('div');
    container.innerHTML = bodyMatch ? bodyMatch[1] : html;

    container.querySelectorAll('style, script, meta, link, title, xml').forEach((el) => el.remove());

    // Word wraps everything in WordSection divs; the parser treats a div as
    // inline context, so unwrap them to keep the paragraphs as blocks.
    container.querySelectorAll('div').forEach((div) => {
        while (div.firstChild) div.parentNode.insertBefore(div.firstChild, div);
        div.remove();
    });

    convertListRuns(container);
    return container.innerHTML;
}

// Word expresses list items as <p style="mso-list:l0 level2 lfo1"> with the
// marker glyph in an mso-list:Ignore span. Read level/type, drop the marker.
// Memoized on the node: removing the marker makes a second call lose the
// ordered/bullet signal, and the run scanner visits nodes twice.
function listInfo(node) {
    if (node.nodeType !== 1 || node.tagName !== 'P') return null;
    if (node._ldListInfo !== undefined) return node._ldListInfo;

    const style = node.getAttribute('style') || '';
    const idMatch = /mso-list:\s*(l\d+)\s+level(\d+)/i.exec(style);
    if (!idMatch && !/MsoListParagraph/i.test(node.className)) {
        node._ldListInfo = null;
        return null;
    }

    let ordered = false;
    const marker = node.querySelector('[style*="mso-list"]');
    if (marker) {
        ordered = /^\s*[0-9a-z]+[.)]/i.test(marker.textContent);
        marker.remove();
    }

    node._ldListInfo = {
        id: idMatch ? idMatch[1] : 'l?',
        level: idMatch ? parseInt(idMatch[2], 10) : 1,
        ordered,
    };
    return node._ldListInfo;
}

function convertListRuns(parent) {
    const nodes = Array.from(parent.childNodes);
    let i = 0;
    while (i < nodes.length) {
        const node = nodes[i];
        const info = node.nodeType === 1 ? listInfo(node) : null;
        if (!info) {
            if (node.nodeType === 1) convertListRuns(node);
            i++;
            continue;
        }
        const run = [{p: node, ...info}];
        i++;
        while (i < nodes.length) {
            const next = nodes[i];
            if (next.nodeType === 3 && !next.nodeValue.trim()) {
                i++;
                continue;
            }
            const inf = next.nodeType === 1 ? listInfo(next) : null;
            if (!inf) break;
            // a different Word list at the top level starts a new run
            if (inf.level === 1 && inf.id !== run[run.length - 1].id) break;
            run.push({p: next, ...inf});
            i++;
        }
        // buildList moves the paragraphs into the new list, so anchor first
        const anchor = document.createComment('list');
        parent.insertBefore(anchor, run[0].p);
        parent.replaceChild(buildList(run), anchor);
    }
}

function buildList(run) {
    const rootList = document.createElement(run[0].ordered ? 'ol' : 'ul');
    const stack = [{list: rootList, level: run[0].level}];
    for (const item of run) {
        while (stack.length > 1 && item.level < stack[stack.length - 1].level) stack.pop();
        if (item.level > stack[stack.length - 1].level) {
            const nested = document.createElement(item.ordered ? 'ol' : 'ul');
            const cur = stack[stack.length - 1].list;
            (cur.lastElementChild || cur).appendChild(nested);
            stack.push({list: nested, level: item.level});
        }
        const li = document.createElement('li');
        li.appendChild(item.p);
        stack[stack.length - 1].list.appendChild(li);
    }
    return rootList;
}
