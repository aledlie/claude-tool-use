/**
 * Preview rendering functions for different file types
 */

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
        ? escapeHtml(content.substring(0, 150)) + '...'
        : escapeHtml(content)
};

/**
 * Render preview for file card (grid view)
 */
function renderCardPreview(item) {
    if (!item.preview) return '';
    const fileType = getFileType(item.ext);
    const cssClass = fileType === 'code' ? '' : `${fileType === 'markdown' ? 'md' : fileType}-preview`;
    const content = previewRenderers[fileType](item.preview, fileType === 'code');
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

    // Default: code preview
    return `
        <div class="detail-section">
            <h3>Preview</h3>
            <pre class="detail-code">${renderedContent}</pre>
        </div>
    `;
}
