// Export the editor's HTML as a Word document or as PDF.
//
// Word: an HTML-based .doc file (the classic WYSIWYG trick) — opens in
// MS Word / LibreOffice with formatting, tables and images intact.
// PDF: a hidden iframe styled like a document, handed to the browser's
// print dialog where the user picks "Save as PDF". No dependencies.

const DOC_CSS = `
  body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
         font-size: 12pt; line-height: 1.55; color: #1d2939; margin: 0; }
  p { margin: 0 0 0.6em; }
  h1, h2, h3, h4, h5, h6 { margin: 1em 0 0.45em; line-height: 1.25; }
  blockquote { margin: 0.6em 0; padding: 2px 0 2px 12px; border-left: 3px solid #c7d2fe; color: #475467; }
  table { border-collapse: collapse; margin: 0.6em 0; }
  td, th { border: 1px solid #98a2b3; padding: 4px 9px; vertical-align: top; }
  img { max-width: 100%; }
  hr { border: 0; border-top: 1px solid #d0d5dd; margin: 1em 0; }
  ul, ol { margin: 0 0 0.6em; padding-left: 1.6em; }
  code { font-family: Consolas, "Courier New", monospace; background: #f2f4f7; padding: 0 3px; }
`;

const PRINT_CSS = `
  @page { margin: 18mm 16mm; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  iframe { display: none; }
`;

// Relative image/embed URLs must become absolute so Word (and the print
// frame) can resolve them outside the app's origin context.
function absolutize(html) {
    const root = document.createElement('div');
    root.innerHTML = html;
    root.querySelectorAll('img').forEach((img) => img.setAttribute('src', img.src));
    root.querySelectorAll('a').forEach((a) => a.setAttribute('href', a.href));
    return root.innerHTML;
}

export function exportWord(html, filename = 'document') {
    const body = absolutize(html);
    const full =
        '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
        'xmlns:w="urn:schemas-microsoft-com:office:word" ' +
        'xmlns="http://www.w3.org/TR/REC-html40">' +
        '<head><meta charset="utf-8"><title>' + filename + '</title>' +
        '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View>' +
        '<w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->' +
        '<style>' + DOC_CSS + '</style></head>' +
        '<body>' + body + '</body></html>';

    // BOM keeps non-ASCII text (cyrillic!) intact when Word sniffs encoding.
    const blob = new Blob(['\ufeff', full], {type: 'application/msword'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '.doc';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function exportPDF(html, filename = 'document') {
    const body = absolutize(html);
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(frame);

    const doc = frame.contentDocument;
    doc.open();
    doc.write(
        '<!doctype html><html><head><meta charset="utf-8"><title>' + filename + '</title>' +
        '<style>' + DOC_CSS + PRINT_CSS + '</style></head>' +
        '<body>' + body + '</body></html>'
    );
    doc.close();

    const win = frame.contentWindow;
    let removed = false;
    const cleanup = () => {
        if (removed) return;
        removed = true;
        setTimeout(() => frame.remove(), 300);
    };
    win.onafterprint = cleanup;

    // Wait for images before printing, with a safety timeout.
    const imgs = Array.from(doc.images);
    const ready = Promise.all(imgs.map((img) => img.complete
        ? null
        : new Promise((resolve) => { img.onload = img.onerror = resolve; })));
    const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
    Promise.race([ready, timeout]).then(() => {
        win.focus();
        win.print();
        // In browsers that never fire afterprint on iframes.
        setTimeout(cleanup, 60000);
    });
}
