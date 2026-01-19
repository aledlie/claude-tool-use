/**
 * Utility functions for file explorer
 */

// File type icons mapping
const FILE_ICONS = {
    'ts': '📘', 'tsx': '⚛️', 'js': '📒', 'jsx': '⚛️',
    'json': '📋', 'jsonl': '📋', 'md': '📝', 'html': '🌐', 'htm': '🌐',
    'css': '🎨', 'scss': '🎨', 'txt': '📄', 'log': '📜',
    'version': '🔖', 'file': '📄', 'sh': '⚙️', 'bash': '⚙️',
    'py': '🐍', 'yaml': '⚙️', 'yml': '⚙️', 'toml': '⚙️'
};

// File type categories for specialized rendering
const FILE_TYPES = {
    html: ['html', 'htm'],
    json: ['json'],
    jsonl: ['jsonl'],
    markdown: ['md', 'markdown'],
    text: ['txt', 'log', 'version', 'file']
};

/**
 * Get the icon for a file extension
 */
function getFileIcon(ext) {
    return FILE_ICONS[ext] || '📄';
}

/**
 * Get the file type category for rendering
 */
function getFileType(ext) {
    for (const [type, extensions] of Object.entries(FILE_TYPES)) {
        if (extensions.includes(ext)) return type;
    }
    return 'code';
}

/**
 * Sort items with folders first, then alphabetically
 */
function sortItems(items) {
    return [...items].sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
    });
}

/**
 * Format file size in human-readable form
 */
function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Get display name for an item (cleans up path prefixes)
 */
function getDisplayName(name) {
    return name.replace(/^-Users-[^-]+-/, '');
}

/**
 * Count folders, files, and total size in a folder
 * Includes truncated (hidden) files in the count
 */
function countItems(folder) {
    let folders = 0, files = 0, size = 0;

    function traverse(item) {
        if (item.type === 'folder') {
            folders++;
            // Add truncated files to the count
            if (item.truncated) {
                files += item.truncated;
            }
            (item.children || []).forEach(traverse);
        } else {
            files++;
            size += item.size || 0;
        }
    }

    (folder.children || []).forEach(traverse);
    return { folders, files, size };
}

/**
 * Filter items based on search query
 */
function filterItems(items, searchQuery) {
    if (!searchQuery) return items;
    return items.filter(item => {
        if (item.name.toLowerCase().includes(searchQuery)) return true;
        if (item.type === 'folder' && item.children) {
            return filterItems(item.children, searchQuery).length > 0;
        }
        return false;
    });
}
