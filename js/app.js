/**
 * Main application logic for file explorer
 */

let currentPath = [];
let currentView = 'grid';
let searchQuery = '';

/**
 * Initialize the application
 */
function init() {
    renderBreadcrumb();
    renderContent();
    updateStats();

    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderContent();
    });
}

/**
 * Set the current view (grid or tree)
 */
function setView(view) {
    currentView = view;
    document.querySelectorAll('.view-toggle .filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    document.getElementById('gridView').style.display = view === 'grid' ? 'grid' : 'none';
    document.getElementById('treeView').style.display = view === 'tree' ? 'block' : 'none';
    renderContent();
}

/**
 * Get the current folder based on path
 */
function getCurrentFolder() {
    let folder = fileStructure;
    for (const segment of currentPath) {
        const child = folder.children?.find(c => c.name === segment);
        if (child && child.type === 'folder') {
            folder = child;
        } else {
            break;
        }
    }
    return folder;
}

/**
 * Navigate to a specific path
 */
function navigateTo(path) {
    currentPath = path;
    renderBreadcrumb();
    renderContent();
    updateStats();
}

/**
 * Render the breadcrumb navigation
 * Uses UX best practices: home icon, chevron separators, truncation, tooltips
 */
function renderBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb');
    const maxVisibleItems = 4; // Show first, ellipsis, last 2 items when path is long

    // Home/root button
    let html = `<span class="breadcrumb-item breadcrumb-home" onclick="navigateTo([])" title="Home" aria-label="Go to root">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
    </span>`;

    if (currentPath.length === 0) {
        breadcrumb.innerHTML = html + `<span class="breadcrumb-current">Home</span>`;
        breadcrumb.setAttribute('aria-label', 'You are at: Home');
        return;
    }

    const needsTruncation = currentPath.length > maxVisibleItems;

    currentPath.forEach((segment, index) => {
        const displaySegment = getDisplayName(segment);
        const isLast = index === currentPath.length - 1;
        const pathToHere = currentPath.slice(0, index + 1);
        const fullPath = '/' + pathToHere.map(getDisplayName).join('/');

        // Truncation: show first item, ellipsis, then last 2 items
        if (needsTruncation && index > 0 && index < currentPath.length - 2) {
            if (index === 1) {
                html += `<span class="breadcrumb-separator" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                    </svg>
                </span>`;
                html += `<span class="breadcrumb-ellipsis" title="Path truncated">•••</span>`;
            }
            return;
        }

        html += `<span class="breadcrumb-separator" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
            </svg>
        </span>`;

        if (isLast) {
            html += `<span class="breadcrumb-current" title="${fullPath}">${truncateSegment(displaySegment)}</span>`;
        } else {
            html += `<span class="breadcrumb-item" onclick="navigateTo(${JSON.stringify(pathToHere)})" title="${fullPath}">${truncateSegment(displaySegment)}</span>`;
        }
    });

    breadcrumb.innerHTML = html;
    breadcrumb.setAttribute('aria-label', 'You are at: ' + currentPath.map(getDisplayName).join(' / '));
}

/**
 * Truncate long segment names for breadcrumb display
 */
function truncateSegment(name, maxLength = 25) {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
}

/**
 * Render content based on current view
 */
function renderContent() {
    if (currentView === 'grid') {
        renderGrid();
    } else {
        renderTree();
    }
}

/**
 * Render the grid view
 */
function renderGrid() {
    const grid = document.getElementById('gridView');
    const folder = getCurrentFolder();
    const items = filterItems(folder.children || [], searchQuery);

    if (items.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">📭</div>
                <p>${searchQuery ? 'No matching files found' : 'This folder is empty'}</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = sortItems(items).map(item => {
        const isFolder = item.type === 'folder';
        const icon = isFolder ? '📁' : getFileIcon(item.ext);

        return `
            <div class="file-card" onclick="${isFolder ? `navigateTo([...${JSON.stringify(currentPath)}, '${item.name}'])` : `openDetail(${JSON.stringify(item).replace(/"/g, '&quot;')})`}">
                <div class="file-card-header">
                    <div class="file-icon ${isFolder ? 'folder' : 'file'}">${icon}</div>
                    <div class="file-name">${getDisplayName(item.name)}</div>
                </div>
                <div class="file-meta">
                    ${isFolder
                        ? `<span>${item.children?.length || 0} items${item.truncated ? ` (+${item.truncated} more)` : ''}</span>`
                        : `<span>${formatSize(item.size)}</span><span>${item.ext?.toUpperCase() || 'FILE'}</span>`}
                </div>
                ${isFolder ? renderFolderPreview(item, currentPath) : renderCardPreview(item)}
            </div>
        `;
    }).join('');
}

/**
 * Render the tree view
 */
function renderTree() {
    const treeView = document.getElementById('treeView');
    treeView.innerHTML = renderTreeItems(fileStructure.children || [], 0);
}

/**
 * Render tree items recursively
 */
function renderTreeItems(items, depth, parentPath = []) {
    return sortItems(items).map(item => {
        const isFolder = item.type === 'folder';
        const indent = '<span class="tree-indent"></span>'.repeat(depth);
        const icon = isFolder ? '📁' : getFileIcon(item.ext);
        const hasChildren = isFolder && item.children?.length > 0;
        const itemPath = [...parentPath, item.name];

        const clickAction = isFolder
            ? `navigateTo(${JSON.stringify(itemPath).replace(/"/g, '&quot;')})`
            : `openDetail(${JSON.stringify(item).replace(/"/g, '&quot;')})`;

        let html = `
            <div class="tree-item" onclick="${clickAction}">
                ${indent}
                <span class="tree-toggle">${hasChildren ? '▸' : ''}</span>
                <span class="tree-icon">${icon}</span>
                <span>${getDisplayName(item.name)}</span>
            </div>
        `;

        if (hasChildren) {
            html += renderTreeItems(item.children, depth + 1, itemPath);
        }

        return html;
    }).join('');
}

/**
 * Update the stats bar
 */
function updateStats() {
    const folder = getCurrentFolder();
    const stats = countItems(folder);

    document.getElementById('folderCount').textContent = stats.folders;
    document.getElementById('fileCount').textContent = stats.files;
    document.getElementById('totalSize').textContent = formatSize(stats.size);
}

/**
 * Open the detail panel for a file
 */
function openDetail(item) {
    const panel = document.getElementById('detailPanel');
    const overlay = document.getElementById('overlay');
    const title = document.getElementById('detailTitle');
    const content = document.getElementById('detailContent');

    title.textContent = item.name;

    content.innerHTML = `
        <div class="detail-section">
            <h3>File Info</h3>
            <p><strong>Type:</strong> ${item.ext?.toUpperCase() || 'Unknown'}</p>
            <p><strong>Size:</strong> ${formatSize(item.size)}</p>
            <p><strong>Path:</strong> /${currentPath.join('/')}/${item.name}</p>
        </div>
        ${renderDetailPreview(item)}
    `;

    panel.classList.add('open');
    overlay.classList.add('open');
}

/**
 * Close the detail panel
 */
function closeDetail() {
    document.getElementById('detailPanel').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
}

// Expose functions globally for HTML onclick handlers and testing
window.setView = setView;
window.navigateTo = navigateTo;
window.openDetail = openDetail;
window.closeDetail = closeDetail;
window.getCurrentFolder = getCurrentFolder;
window.openJsonlEntry = openJsonlEntry;

// Initialize on load
init();
