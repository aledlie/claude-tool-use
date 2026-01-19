#!/usr/bin/env node
/**
 * Generates fileStructure data from the actual directory contents.
 * Run with: node scripts/generate-structure.js > js/data.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', '.claude', 'scripts', 'css', 'js', 'docs']);
const SKIP_FILES = new Set(['index.html', 'package-lock.json', 'playwright.config.ts', 'package.json', 'CLAUDE.md', '.gitignore', 'README.md']);
const LARGE_DIRS = new Set(['debug', 'todos', 'file-history', 'shell-snapshots']); // Skip previews in large dirs
const MAX_PREVIEW_SIZE = 100;
const MAX_FILES_PER_DIR = 20; // Default limit
const MAX_FILES_LARGE_DIR = 10; // Limit for large directories
const MAX_FILE_SIZE_FOR_PREVIEW = 2 * 1024; // 2KB max for preview

/**
 * Get file extension, handling special cases
 */
function getExtension(filename) {
    if (filename.includes('@v')) return 'version';
    const ext = path.extname(filename).slice(1).toLowerCase();
    return ext || 'file';
}

/**
 * Read file preview (first N characters)
 */
function getPreview(filePath, maxSize = MAX_PREVIEW_SIZE) {
    try {
        const stats = fs.statSync(filePath);
        if (stats.size > 1024 * 1024) return '[File too large for preview]';

        const content = fs.readFileSync(filePath, 'utf8');
        if (content.length <= maxSize) return content;
        return content.substring(0, maxSize) + '...';
    } catch (e) {
        return '';
    }
}

/**
 * Read JSONL preview (first N lines, regardless of file size)
 */
function getJsonlPreview(filePath, maxLines = 10) {
    try {
        const fd = fs.openSync(filePath, 'r');
        const buffer = Buffer.alloc(8192); // Read first 8KB
        const bytesRead = fs.readSync(fd, buffer, 0, 8192, 0);
        fs.closeSync(fd);

        const content = buffer.toString('utf8', 0, bytesRead);
        const lines = content.split('\n').filter(l => l.trim()).slice(0, maxLines);
        return lines.join('\n');
    } catch (e) {
        return '';
    }
}

/**
 * Build file structure recursively
 */
function buildStructure(dirPath, relativePath = '', skipPreviews = false) {
    const name = path.basename(dirPath) || 'claude-history';
    const children = [];
    // Mark dirs with many files or session data as large (skip previews, limit files)
    const isLargeDir = LARGE_DIRS.has(name) || name.startsWith('-Users-') || skipPreviews;

    let entries;
    try {
        entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch (e) {
        return { name, type: 'folder', children: [] };
    }

    // Sort: folders first, then by name
    entries.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
    });

    let fileCount = 0;
    const maxFiles = isLargeDir ? MAX_FILES_LARGE_DIR : MAX_FILES_PER_DIR;

    for (const entry of entries) {
        if (entry.name.startsWith('.') && entry.name !== '.claude') continue;
        if (SKIP_DIRS.has(entry.name)) continue;
        if (SKIP_FILES.has(entry.name)) continue;

        const entryPath = path.join(dirPath, entry.name);
        const entryRelPath = path.join(relativePath, entry.name);

        if (entry.isDirectory()) {
            children.push(buildStructure(entryPath, entryRelPath, isLargeDir));
        } else {
            // Limit files per directory
            if (fileCount >= maxFiles) continue;
            fileCount++;

            try {
                const stats = fs.statSync(entryPath);
                const ext = getExtension(entry.name);

                const fileNode = {
                    name: entry.name,
                    type: 'file',
                    size: stats.size,
                    ext: ext
                };

                // Add previews for text-based files
                if (ext === 'jsonl') {
                    // JSONL files: always read first few lines regardless of file size
                    const preview = getJsonlPreview(entryPath);
                    if (preview && preview.length > 10) fileNode.preview = preview;
                } else if (!isLargeDir && stats.size < MAX_FILE_SIZE_FOR_PREVIEW && isTextFile(ext)) {
                    // Other text files: only if small enough and not in large dir
                    const preview = getPreview(entryPath);
                    if (preview && preview.length > 10) fileNode.preview = preview;
                }

                children.push(fileNode);
            } catch (e) {
                // Skip files we can't read
            }
        }
    }

    // Count total files in directory (not just shown ones)
    const totalFiles = entries.filter(e => !e.isDirectory() && !e.name.startsWith('.')).length;
    const result = { name, type: 'folder', children };
    if (totalFiles > maxFiles) {
        result.truncated = totalFiles - maxFiles; // Indicates how many files are not shown
    }
    return result;
}

/**
 * Check if file extension indicates a text file
 */
function isTextFile(ext) {
    const textExtensions = new Set([
        'txt', 'json', 'jsonl', 'md', 'js', 'ts', 'tsx', 'jsx',
        'css', 'html', 'htm', 'xml', 'yaml', 'yml', 'toml',
        'sh', 'bash', 'py', 'rb', 'go', 'rs', 'java', 'c', 'h',
        'cpp', 'hpp', 'cs', 'swift', 'kt', 'scala', 'sql',
        'version', 'file', 'log', 'env', 'gitignore', 'prettierrc'
    ]);
    return textExtensions.has(ext);
}

// Generate the structure
const structure = buildStructure(ROOT_DIR);

// Output as JavaScript module
console.log(`/**
 * Repository file structure data
 * Auto-generated from directory contents
 * Generated: ${new Date().toISOString()}
 */
const fileStructure = ${JSON.stringify(structure, null, 2)};
`);
