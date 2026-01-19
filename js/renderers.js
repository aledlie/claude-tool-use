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
    markdown: (content) => parseMarkdown(content),
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
    const classMap = { markdown: 'md-preview', html: 'html-preview', json: 'json-preview', code: 'code-preview' };
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

    // Default: code preview with syntax highlighting
    return `
        <div class="detail-section">
            <h3>Code Preview</h3>
            <pre class="detail-code code-preview">${renderedContent}</pre>
        </div>
    `;
}
