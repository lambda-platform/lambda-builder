<template>
    <div class="ld-fm-overlay" :class="{'ld-fm-overlay--full': full}" @mousedown.self="$emit('close')">
        <div class="ld-fm" :class="{'ld-fm--full': full}" ref="modal">
            <div class="ld-fm-head">
                <input class="ld-fm-search" type="text" placeholder="Search" v-model="query" ref="search"/>
                <button class="ld-fm-fullbtn" type="button" :title="full ? 'Exit full size' : 'Full size'"
                        @click="full = !full">
                    <span v-html="full ? icons.shrink : icons.expand"></span>
                </button>
                <button class="ld-fm-close" type="button" title="Close" @click="$emit('close')">✕</button>
            </div>
            <div class="ld-fm-body">
                <div class="ld-fm-side">
                    <div class="ld-fm-nav" :class="{active: tab === t.key}" v-for="t in tabs" :key="t.key"
                         @click="setTab(t.key)">
                        <span v-html="t.icon"></span> {{ t.label }}
                    </div>
                </div>
                <div class="ld-fm-main">
                    <div class="ld-fm-toolbar">
                        <template v-if="selected">
                            <button v-if="selected.type === 'file'" class="ld-fm-act ld-fm-act--primary"
                                    type="button" @click="choose">
                                <span v-html="icons.check"></span> Choose
                            </button>
                            <button v-if="selected.type === 'file'" class="ld-fm-act" type="button" @click="download">
                                <span v-html="icons.download"></span> Download
                            </button>
                            <button class="ld-fm-act" type="button" @click="renameSelected">
                                <span v-html="icons.pencil"></span> Rename
                            </button>
                            <button class="ld-fm-act" type="button" @click="deleteSelected">
                                <span v-html="icons.trash"></span> Delete
                            </button>
                        </template>
                        <template v-else>
                            <button class="ld-fm-act" type="button" @click="newFolder">
                                <span v-html="icons.folderPlus"></span> Add folder
                            </button>
                        </template>
                        <button class="ld-fm-upload" type="button" @click="upload">
                            <span v-html="icons.upload"></span> Upload
                        </button>
                    </div>
                    <div class="ld-fm-crumbs" v-if="segments.length">
                        <span class="ld-fm-crumb" @click="goTo(-1)">{{ activeTab.label }}</span>
                        <template v-for="(segment, i) in segments">
                            <span class="ld-fm-crumb-sep" :key="'s-' + i">/</span>
                            <span class="ld-fm-crumb" :key="'c-' + i" @click="goTo(i)">{{ segment }}</span>
                        </template>
                    </div>
                    <div class="ld-fm-content" @mousedown="contentDown">
                        <div class="ld-fm-empty" v-if="loading">Loading…</div>
                        <div class="ld-fm-empty" v-else-if="!filteredFolders.length && !filteredFiles.length">
                            Empty folder
                        </div>
                        <div class="ld-fm-grid" v-else>
                            <div class="ld-fm-card" v-for="folder in filteredFolders" :key="'d-' + folder"
                                 :class="{selected: isSelected('folder', folder)}"
                                 @click="select('folder', folder)" @dblclick="open(folder)">
                                <div class="ld-fm-thumb ld-fm-folder-thumb"><span v-html="icons.folder"></span></div>
                                <div class="ld-fm-name">
                                    <span class="ld-fm-name-text">{{ folder }}</span>
                                    <span class="ld-fm-tick" v-if="isSelected('folder', folder)" v-html="icons.check"></span>
                                </div>
                            </div>
                            <div class="ld-fm-card" v-for="file in filteredFiles" :key="file.path"
                                 :class="{selected: isSelected('file', file.path)}"
                                 @click="select('file', file.path, file)" @dblclick="$emit('pick', file)">
                                <span class="ld-fm-badge">{{ ext(file.name) }}</span>
                                <div class="ld-fm-thumb" v-if="file.isImage"
                                     :style="{backgroundImage: `url(${JSON.stringify(file.thumb || file.src)})`}"></div>
                                <div class="ld-fm-thumb ld-fm-ext" v-else>{{ ext(file.name) }}</div>
                                <div class="ld-fm-name">
                                    <span class="ld-fm-name-text">{{ file.name }}</span>
                                    <span class="ld-fm-tick" v-if="isSelected('file', file.path)" v-html="icons.check"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import {ICON, svgIcon} from './icons.js';
import {ldPrompt, ldConfirm, ldAlert} from './dialog.js';

// Media library backed by lambda-laravel's Dataform/Editor file manager API.
// Files live in the host project's storage/app/filemanager directory; the
// sidebar tabs map to its top-level images/files/documents folders. Click
// selects a card (toolbar actions apply to it); double-click a file inserts
// it, double-click a folder opens it.
const API = '/lambda/filemanager';

export default {
    data() {
        return {
            query: '',
            tab: 'images',
            subPath: '',
            folders: [],
            files: [],
            loading: false,
            full: false,
            selected: null, // {type: 'file'|'folder', key, file?}
            tabs: [
                {key: 'images', label: 'Images', icon: svgIcon(ICON.image, 17)},
                {key: 'files', label: 'Files', icon: svgIcon(ICON.folderImage, 17)},
                {key: 'documents', label: 'Documents', icon: svgIcon(ICON.code, 17)},
            ],
            icons: {
                upload: svgIcon(ICON.upload, 15),
                folder: svgIcon(ICON.folder, 40),
                folderPlus: svgIcon(ICON.folderPlus, 15),
                check: svgIcon(ICON.check, 14),
                download: svgIcon(ICON.download, 15),
                pencil: svgIcon(ICON.pencil, 14),
                trash: svgIcon(ICON.trash, 15),
                expand: svgIcon(ICON.expand, 15),
                shrink: svgIcon(ICON.shrink, 15),
            },
        };
    },
    computed: {
        path() {
            return this.subPath ? `${this.tab}/${this.subPath}` : this.tab;
        },
        segments() {
            return this.subPath ? this.subPath.split('/') : [];
        },
        activeTab() {
            return this.tabs.find((t) => t.key === this.tab);
        },
        filteredFolders() {
            const q = this.query.trim().toLowerCase();
            return this.folders.filter((f) => f.toLowerCase().includes(q));
        },
        filteredFiles() {
            const q = this.query.trim().toLowerCase();
            return this.files.filter((f) => f.name.toLowerCase().includes(q));
        },
    },
    mounted() {
        this.$refs.search.focus();
        this.load();
    },
    methods: {
        async load() {
            this.loading = true;
            this.selected = null;
            try {
                const {data} = await axios.get(`${API}/files`, {params: {path: this.path}});
                this.folders = data.folders;
                this.files = data.files;
            } catch (e) {
                this.folders = [];
                this.files = [];
            }
            this.loading = false;
        },
        setTab(key) {
            if (this.tab === key) return;
            this.tab = key;
            this.subPath = '';
            this.load();
        },
        open(folder) {
            this.subPath = this.subPath ? `${this.subPath}/${folder}` : folder;
            this.load();
        },
        goTo(i) {
            this.subPath = i < 0 ? '' : this.segments.slice(0, i + 1).join('/');
            this.load();
        },
        select(type, key, file = null) {
            this.selected = {type, key, file};
        },
        contentDown(e) {
            // clicking anywhere that's not a card clears the selection
            if (!e.target.closest || !e.target.closest('.ld-fm-card')) this.selected = null;
        },
        isSelected(type, key) {
            return !!this.selected && this.selected.type === type && this.selected.key === key;
        },
        choose() {
            if (this.selected && this.selected.type === 'file') this.$emit('pick', this.selected.file);
        },
        download() {
            if (!this.selected || this.selected.type !== 'file') return;
            const a = document.createElement('a');
            a.href = this.selected.file.src;
            a.download = this.selected.file.name;
            document.body.appendChild(a);
            a.click();
            a.remove();
        },
        async renameSelected() {
            if (!this.selected) return;
            const isFile = this.selected.type === 'file';
            const current = isFile ? this.selected.file.name : this.selected.key;
            const itemPath = isFile ? this.selected.file.path : `${this.path}/${this.selected.key}`;
            const name = await ldPrompt({
                title: 'Rename', label: 'New name', value: current, icon: 'pencil',
                container: this.$refs.modal,
            });
            if (!name || name === current) return;
            const {data} = await axios.post(`${API}/rename`, {path: itemPath, name});
            if (data && data.status === false) {
                await ldAlert({
                    title: 'Rename failed', message: data.message || 'Could not rename this item.',
                    container: this.$refs.modal,
                });
            }
            this.load();
        },
        async deleteSelected() {
            if (!this.selected) return;
            const isFile = this.selected.type === 'file';
            const label = isFile ? `"${this.selected.file.name}"` : `folder "${this.selected.key}" and everything in it`;
            const itemPath = isFile ? this.selected.file.path : `${this.path}/${this.selected.key}`;
            const ok = await ldConfirm({
                title: 'Delete', message: `Delete ${label}? This cannot be undone.`,
                container: this.$refs.modal,
            });
            if (!ok) return;
            await axios.post(`${API}/delete`, {path: itemPath});
            this.load();
        },
        upload() {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            if (this.tab === 'images') input.accept = 'image/*';
            input.onchange = async () => {
                const failed = [];
                for (const file of input.files) {
                    const form = new FormData();
                    form.append('file', file);
                    form.append('path', this.path);
                    try {
                        await axios.post(`${API}/upload`, form);
                    } catch (e) {
                        failed.push(file.name);
                    }
                }
                if (failed.length) {
                    await ldAlert({
                        title: 'Upload failed', message: failed.join(', '), icon: 'upload',
                        container: this.$refs.modal,
                    });
                }
                this.load();
            };
            input.click();
        },
        async newFolder() {
            const name = await ldPrompt({
                title: 'Add folder', label: 'Folder name', icon: 'folderPlus',
                container: this.$refs.modal,
            });
            if (!name) return;
            await axios.post(`${API}/folder`, {path: this.path, name});
            this.load();
        },
        ext(name) {
            const m = /\.([^.]+)$/.exec(name);
            return m ? m[1].toUpperCase() : 'FILE';
        },
    },
};
</script>

<style>
/* CKBox-style layout: near-fullscreen modal, white sidebar, gray content. */
.ld-fm-overlay .ld-fm {
    width: min(1400px, 100%);
    height: min(900px, 100%);
    border-radius: 10px;
}
.ld-fm-overlay--full {
    padding: 0;
}
.ld-fm-overlay .ld-fm--full {
    width: 100%;
    height: 100%;
    border-radius: 0;
}
.ld-fm-overlay .ld-fm {
    position: relative;
}
.ld-fm-overlay .ld-fm-head {
    justify-content: center;
    position: relative;
    padding: 10px 92px;
    background: #f7f8fa;
    border-bottom: 1px solid #e4e7ec;
}
.ld-fm-overlay .ld-fm-search {
    background: #fff;
}
.ld-fm-fullbtn {
    position: absolute;
    right: 46px;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: #667085;
    cursor: pointer;
}
.ld-fm-fullbtn:hover {
    background: #eaecf0;
}
.ld-fm-overlay .ld-fm-search {
    flex: 0 1 440px;
    height: 34px;
    border-radius: 8px;
}
.ld-fm-overlay .ld-fm-close {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 32px;
}
.ld-fm-overlay .ld-fm-close:hover {
    background: #eaecf0;
}
.ld-fm-overlay .ld-fm-side {
    width: 210px;
    background: #fff;
    border-right: 1px solid #e4e7ec;
    padding: 12px 10px;
}
.ld-fm-overlay .ld-fm-nav {
    padding: 9px 12px;
    font-size: 14px;
}
.ld-fm-overlay .ld-fm-main {
    display: flex;
    flex-direction: column;
    background: #eef0f3;
    padding: 0;
    overflow: hidden;
}
.ld-fm-toolbar {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    min-height: 54px;
    padding: 10px 16px;
    background: #fff;
    border-bottom: 1px solid #e4e7ec;
}
.ld-fm-act {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    height: 34px;
    padding: 0 12px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: #475467;
    font-size: 13.5px;
    cursor: pointer;
}
.ld-fm-act:hover {
    background: #f2f4f7;
}
.ld-fm-act--primary {
    border: 1px solid #2563eb;
    border-radius: 17px;
    color: #2563eb;
}
.ld-fm-act--primary:hover {
    background: #eff6ff;
}
.ld-fm-overlay .ld-fm-upload {
    margin-left: auto;
    height: 34px;
    border-radius: 8px;
    background: #2563eb;
    color: #fff;
    font-size: 13.5px;
}
.ld-fm-overlay .ld-fm-upload:hover {
    background: #1d4ed8;
}
.ld-fm-crumbs {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px;
    flex-shrink: 0;
    padding: 10px 16px 0;
    font-size: 13px;
    color: #475467;
}
.ld-fm-crumb {
    padding: 2px 6px;
    border-radius: 6px;
    cursor: pointer;
}
.ld-fm-crumb:hover {
    background: #e4e7ec;
}
.ld-fm-crumb:last-child {
    color: #101828;
    font-weight: 500;
}
.ld-fm-crumb-sep {
    color: #98a2b3;
}
.ld-fm-content {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 16px;
}
.ld-fm-overlay .ld-fm-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(172px, 1fr));
    gap: 16px;
}
.ld-fm-overlay .ld-fm-card {
    position: relative;
    background: #fff;
    border: 1px solid #e4e7ec;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.12s, box-shadow 0.12s;
    user-select: none;
}
.ld-fm-overlay .ld-fm-card:hover {
    border-color: #c7d2fe;
    box-shadow: 0 4px 12px rgba(16, 24, 40, 0.08);
}
.ld-fm-overlay .ld-fm-card.selected {
    border-color: #2563eb;
    box-shadow: 0 0 0 1px #2563eb;
}
.ld-fm-overlay .ld-fm-thumb {
    aspect-ratio: 1 / 1;
    background-size: cover;
    background-position: center;
}
.ld-fm-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 1;
    padding: 2px 7px;
    border-radius: 4px;
    background: #101828;
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.03em;
}
.ld-fm-overlay .ld-fm-name {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 9px 10px;
    border-top: 1px solid #f2f4f7;
    background: #fff;
    font-size: 12.5px;
    color: #344054;
}
.ld-fm-name-text {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.ld-fm-tick {
    flex-shrink: 0;
    color: #2563eb;
}
.ld-fm-folder-thumb {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9fafb;
    color: #98a2b3;
}
.ld-fm-ext {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9fafb;
    color: #475467;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.04em;
}
.ld-fm-empty {
    padding: 48px 0;
    text-align: center;
    color: #98a2b3;
    font-size: 14px;
}
</style>
