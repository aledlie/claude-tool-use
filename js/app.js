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
 */
function renderBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb');
    let html = `<span class="breadcrumb-item" onclick="navigateTo([])">/</span>`;

    currentPath.forEach((segment, index) => {
        html += `<span class="breadcrumb-separator">/</span>`;
        if (index === currentPath.length - 1) {
            html += `<span class="breadcrumb-current">${segment}</span>`;
        } else {
            const pathToHere = currentPath.slice(0, index + 1);
            html += `<span class="breadcrumb-item" onclick="navigateTo(${JSON.stringify(pathToHere)})">${segment}</span>`;
        }
    });

    breadcrumb.innerHTML = html;
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
                    <div class="file-name">${item.name}</div>
                </div>
                <div class="file-meta">
                    ${isFolder
                        ? `<span>${item.children?.length || 0} items</span>`
                        : `<span>${formatSize(item.size)}</span><span>${item.ext?.toUpperCase() || 'FILE'}</span>`}
                </div>
                ${isFolder ? '' : renderCardPreview(item)}
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
function renderTreeItems(items, depth) {
    return sortItems(items).map(item => {
        const isFolder = item.type === 'folder';
        const indent = '<span class="tree-indent"></span>'.repeat(depth);
        const icon = isFolder ? '📁' : getFileIcon(item.ext);
        const hasChildren = isFolder && item.children?.length > 0;

        let html = `
            <div class="tree-item" onclick="${isFolder ? '' : `openDetail(${JSON.stringify(item).replace(/"/g, '&quot;')})`}">
                ${indent}
                <span class="tree-toggle">${hasChildren ? '▸' : ''}</span>
                <span class="tree-icon">${icon}</span>
                <span>${item.name}</span>
            </div>
        `;

        if (hasChildren) {
            html += renderTreeItems(item.children, depth + 1);
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

// Initialize on load
init();
