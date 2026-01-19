/**
 * Preview rendering functions for different file types
 */

/**
 * Apply syntax highlighting to code (TypeScript/JavaScript)
 */
function highlightCode(code) {
    let html = escapeHtml(code);

    // Comments (single-line)
    html = html.replace(/(\/\/[^\n]*)/g, '<span class="code-comment">$1</span>');

    // Strings (double and single quotes)
    html = html.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="code-string">$1</span>');
    html = html.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="code-string">$1</span>');

    // Keywords
    const keywords = ['import', 'export', 'from', 'const', 'let', 'var', 'function', 'return',
                      'if', 'else', 'for', 'while', 'class', 'extends', 'new', 'this',
                      'async', 'await', 'try', 'catch', 'throw', 'default', 'typeof',
                      'interface', 'type', 'enum', 'implements', 'private', 'public', 'protected'];
    const keywordPattern = new RegExp('\\b(' + keywords.join('|') + ')\\b', 'g');
    html = html.replace(keywordPattern, '<span class="code-keyword">$1</span>');

    // Types (capitalized words, common types)
    html = html.replace(/\b([A-Z][a-zA-Z0-9]*)\b/g, '<span class="code-type">$1</span>');
    html = html.replace(/:\s*(string|number|boolean|void|any|null|undefined)\b/g, ': <span class="code-type">$1</span>');

    // Numbers
    html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="code-number">$1</span>');

    // Function calls
    html = html.replace(/\b([a-z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="code-function">$1</span>(');

    // Operators
    html = html.replace(/(&gt;|&lt;|=&gt;|===|!==|==|!=|\|\||&amp;&amp;)/g, '<span class="code-operator">$1</span>');

    return html;
}

/**
 * Format JSON with syntax highlighting
 */
function formatJson(jsonStr) {
    try {
        const parsed = JSON.parse(jsonStr);
        const formatted = JSON.stringify(parsed, null, 2);
        return syntaxHighlightJson(formatted);
    } catch (e) {
        return escapeHtml(jsonStr);
    }
}

/**
 * Apply syntax highlighting to JSON string
 */
function syntaxHighlightJson(json) {
    return escapeHtml(json)
        .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
        .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
        .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
        .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
        .replace(/: (null)/g, ': <span class="json-null">$1</span>');
}

/**
 * Format JSONL (JSON Lines) content
 * Each line is a separate JSON object
 */
function formatJsonl(content, truncate = false) {
    const lines = content.split('\n').filter(line => line.trim());
    const maxLines = truncate ? 3 : 20;
    const displayLines = lines.slice(0, maxLines);

    const formatted = displayLines.map((line, idx) => {
        try {
            const parsed = JSON.parse(line);
            const type = parsed.type || 'entry';
            const summary = getJsonlSummary(parsed);
            const encodedLine = btoa(encodeURIComponent(line));
            return `<div class="jsonl-entry jsonl-clickable" onclick="openJsonlEntry('${encodedLine}', '${escapeHtml(type)}')">
                <span class="jsonl-index">${idx + 1}</span>
                <span class="jsonl-type">${escapeHtml(type)}</span>
                <span class="jsonl-summary">${escapeHtml(summary)}</span>
            </div>`;
        } catch (e) {
            return `<div class="jsonl-entry jsonl-invalid">
                <span class="jsonl-index">${idx + 1}</span>
                <span class="jsonl-summary">${escapeHtml(line.substring(0, 50))}...</span>
            </div>`;
        }
    }).join('');

    const remaining = lines.length - displayLines.length;
    const moreHtml = remaining > 0 ? `<div class="jsonl-more">+${remaining} more entries</div>` : '';

    return formatted + moreHtml;
}

/**
 * Open a new page displaying the full JSONL entry
 */
function openJsonlEntry(encodedData, type) {
    event.stopPropagation();

    const jsonString = decodeURIComponent(atob(encodedData));
    let formattedJson;
    try {
        const parsed = JSON.parse(jsonString);
        formattedJson = JSON.stringify(parsed, null, 2);
    } catch (e) {
        formattedJson = jsonString;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSONL Entry: ${type}</title>
    <style>
        :root {
            --primary: #1976d2;
            --background: #1e1e1e;
            --surface: #252526;
            --text: #d4d4d4;
            --border: #3c3c3c;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--background);
            color: var(--text);
            line-height: 1.6;
        }
        .header {
            background: var(--primary);
            color: white;
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header h1 { font-size: 1.25rem; font-weight: 500; }
        .type-badge {
            background: rgba(255,255,255,0.2);
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 0.875rem;
            text-transform: uppercase;
        }
        .content {
            padding: 24px;
            max-width: 1200px;
            margin: 0 auto;
        }
        pre {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 20px;
            overflow-x: auto;
            font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
            font-size: 0.875rem;
            line-height: 1.5;
        }
        .json-key { color: #9cdcfe; }
        .json-string { color: #ce9178; }
        .json-number { color: #b5cea8; }
        .json-boolean { color: #569cd6; }
        .json-null { color: #569cd6; }
        .back-link {
            display: inline-block;
            margin-bottom: 16px;
            color: var(--primary);
            text-decoration: none;
        }
        .back-link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="header">
        <h1>JSONL Entry</h1>
        <span class="type-badge">${type}</span>
    </div>
    <div class="content">
        <a href="javascript:window.close()" class="back-link">&larr; Close</a>
        <pre id="json-content"></pre>
    </div>
    <script>
        const jsonStr = ${JSON.stringify(formattedJson)};
        const highlighted = jsonStr
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
            .replace(/: "([^"]*)"(,?)/g, ': <span class="json-string">"$1"</span>$2')
            .replace(/: (\\d+\\.?\\d*)(,?)/g, ': <span class="json-number">$1</span>$2')
            .replace(/: (true|false)(,?)/g, ': <span class="json-boolean">$1</span>$2')
            .replace(/: (null)(,?)/g, ': <span class="json-null">$1</span>$2');
        document.getElementById('json-content').innerHTML = highlighted;
    </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

/**
 * Extract a meaningful summary from a JSONL entry
 */
function getJsonlSummary(obj) {
    // Common fields to look for in Claude history JSONL
    if (obj.summary) return obj.summary;
    if (obj.message?.content) {
        const content = typeof obj.message.content === 'string'
            ? obj.message.content
            : JSON.stringify(obj.message.content);
        return content.substring(0, 60) + (content.length > 60 ? '...' : '');
    }
    if (obj.content) {
        const content = typeof obj.content === 'string' ? obj.content : JSON.stringify(obj.content);
        return content.substring(0, 60) + (content.length > 60 ? '...' : '');
    }
    if (obj.subtype) return obj.subtype;
    if (obj.uuid) return obj.uuid.substring(0, 8) + '...';
    return Object.keys(obj).slice(0, 3).join(', ');
}

/**
 * Parse markdown to HTML
 */
function parseMarkdown(md) {
    let html = escapeHtml(md);
    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Unordered lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-3]>)/g, '$1');
    html = html.replace(/(<\/h[1-3]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    return html;
}

// Preview renderers by file type
const previewRenderers = {
    html: (content) => content,
    json: (content) => formatJson(content),
    jsonl: (content, truncate) => formatJsonl(content, truncate),
    markdown: (content) => parseMarkdown(content),
    text: (content, truncate) => truncate
        ? escapeHtml(content.substring(0, 150)) + '...'
        : escapeHtml(content),
    code: (content, truncate) => truncate
        ? highlightCode(content.substring(0, 150)) + '<span class="code-comment">...</span>'
        : highlightCode(content)
};

/**
 * Render preview for folder contents
 */
function renderFolderPreview(folder, parentPath) {
    if (!folder.children || folder.children.length === 0) return '';

    const sorted = sortItems(folder.children);
    const previewItems = sorted.slice(0, 5);
    const folderPath = [...parentPath, folder.name];

    const itemsHtml = previewItems.map(item => {
        const isFolder = item.type === 'folder';
        const icon = isFolder ? '📁' : getFileIcon(item.ext);
        const clickAction = isFolder
            ? `navigateTo(${JSON.stringify([...folderPath, item.name]).replace(/"/g, '&quot;')})`
            : `openDetail(${JSON.stringify(item).replace(/"/g, '&quot;')})`;
        return `<div class="folder-preview-item" onclick="event.stopPropagation(); ${clickAction}"><span>${icon}</span><span class="folder-preview-name">${item.name}</span></div>`;
    }).join('');

    const moreCount = sorted.length - previewItems.length;
    const moreHtml = moreCount > 0 ? `<div class="folder-preview-more">+${moreCount} more</div>` : '';

    return `<div class="file-preview folder-preview">${itemsHtml}${moreHtml}</div>`;
}

/**
 * Render preview for file card (grid view)
 */
function renderCardPreview(item) {
    if (!item.preview) return '';
    const fileType = getFileType(item.ext);
    const classMap = { markdown: 'md-preview', html: 'html-preview', json: 'json-preview', jsonl: 'jsonl-preview', code: 'code-preview', text: 'text-preview' };
    const cssClass = classMap[fileType] || '';
    const content = previewRenderers[fileType](item.preview, true);
    return `<div class="file-preview ${cssClass}">${content}</div>`;
}

/**
 * Render preview for detail panel
 */
function renderDetailPreview(item) {
    if (!item.preview) return '';
    const fileType = getFileType(item.ext);
    const renderedContent = previewRenderers[fileType](item.preview, false);

    // Types that show both rendered and source
    if (fileType === 'html' || fileType === 'markdown') {
        return `
            <div class="detail-section">
                <h3>Rendered Preview</h3>
                <div class="${fileType === 'markdown' ? 'md' : fileType}-preview">${renderedContent}</div>
            </div>
            <div class="detail-section">
                <h3>Source</h3>
                <pre class="detail-code">${escapeHtml(item.preview)}</pre>
            </div>
        `;
    }

    // JSON shows formatted only
    if (fileType === 'json') {
        return `
            <div class="detail-section">
                <h3>Formatted JSON</h3>
                <pre class="detail-code json-preview">${renderedContent}</pre>
            </div>
        `;
    }

    // JSONL shows structured entries
    if (fileType === 'jsonl') {
        return `
            <div class="detail-section">
                <h3>JSONL Entries</h3>
                <div class="jsonl-preview">${renderedContent}</div>
            </div>
        `;
    }

    // Plain text files
    if (fileType === 'text') {
        return `
            <div class="detail-section">
                <h3>Content</h3>
                <pre class="detail-code">${renderedContent}</pre>
            </div>
        `;
    }

    // Default: code preview with syntax highlighting
    return `
        <div class="detail-section">
            <h3>Code Preview</h3>
            <pre class="detail-code code-preview">${renderedContent}</pre>
        </div>
    `;
}
