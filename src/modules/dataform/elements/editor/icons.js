// Inline SVG icons shared by the editor toolbar and file manager
// (ported from @lambda-editor/core demo — self-contained, no icon font).

export const ICON = {
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-2"/>',
    redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h2"/>',
    alignLeft: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="18" y2="18"/>',
    alignCenter: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="5" y1="18" x2="19" y2="18"/>',
    alignRight: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="6" y1="18" x2="20" y2="18"/>',
    alignJustify: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    source: '<polyline points="15 17 20 12 15 7"/><polyline points="9 7 4 12 9 17"/><line x1="13.5" y1="4.5" x2="10.5" y2="19.5"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    quote: '<path d="M9 7H5v5h3v1a3 3 0 0 1-3 3"/><path d="M19 7h-4v5h3v1a3 3 0 0 1-3 3"/>',
    bulletList:
        '<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4.5" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1.3" fill="currentColor" stroke="none"/>',
    orderedList:
        '<line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/><text x="2" y="8" font-size="7" fill="currentColor" stroke="none">1</text><text x="2" y="14" font-size="7" fill="currentColor" stroke="none">2</text><text x="2" y="20" font-size="7" fill="currentColor" stroke="none">3</text>',
    indent: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><polyline points="3 10 6 12 3 14"/>',
    outdent: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><polyline points="6 10 3 12 6 14"/>',
    hr: '<line x1="4" y1="12" x2="20" y2="12"/>',
    table:
        '<rect x="3" y="4" width="18" height="16" rx="1.5"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="4" x2="9" y2="20"/><line x1="15" y1="4" x2="15" y2="20"/>',
    eraser: '<path d="M8 20h13"/><path d="M15 4 20 9 10 19H6l-2-2a2 2 0 0 1 0-3z"/>',
    highlight: '<path d="M4 20h16"/><path d="M7 15l7-7 3 3-7 7H7z"/>',
    upload: '<path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    folderPlus:
        '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="17.5" cy="17.5" r="5.4" fill="currentColor" stroke="none"/><path d="M17.5 14.4v6.2M14.4 17.5h6.2" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/>',
    folderImage:
        '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="m7 17 3-3 2 2 3-3 3 3"/><circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3 3 15 0 18c-3-3-3-15 0-18"/>',
    lineHeight:
        '<line x1="13" y1="6" x2="21" y2="6"/><line x1="13" y1="12" x2="21" y2="12"/><line x1="13" y1="18" x2="21" y2="18"/><path d="M6 5v14"/><path d="m3 8 3-3 3 3"/><path d="m3 16 3 3 3-3"/>',
    check: '<polyline points="4 12.5 9.5 18 20 6"/>',
    download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 19h14"/>',
    pencil: '<path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
    expand: '<path d="M15 3h6v6"/><path d="m21 3-8 8"/><path d="M9 21H3v-6"/><path d="m3 21 8-8"/>',
    word: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><text x="7.2" y="18" font-size="8.5" font-weight="700" fill="currentColor" stroke="none">W</text>',
    embed: '<rect x="2.5" y="4" width="19" height="16" rx="2"/><polyline points="10 9.5 7.5 12 10 14.5"/><polyline points="14 9.5 16.5 12 14 14.5"/>',
    shrink: '<path d="M20 10h-6V4"/><path d="m14 10 7-7"/><path d="M4 14h6v6"/><path d="m10 14-7 7"/>',
};

export function svgIcon(inner, size = 16) {
    return `<span class="ld-ic"><svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg></span>`;
}

// Read a local image file as a data URL, then hand it to `cb`.
export function pickImageFile(cb) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => cb(reader.result, file.name.replace(/\.[^.]+$/, ''));
        reader.readAsDataURL(file);
    });
    input.click();
}
