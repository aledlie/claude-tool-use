# claude-tool-use

Static HTML file explorer for browsing repository file structures.

## Project Structure

```
claude-tool-use/
├── index.html          # Main file explorer interface
├── CLAUDE.md           # This file
└── .claude/
    └── settings.local.json
```

## Current Status

- **Phase**: Initial Development
- **Last Updated**: 2025-01-19
- **Files**: 1 (index.html - 34KB)

See `docs/SESSION_HISTORY.md` for session details.

## Quick Start

```bash
# Open in browser
open index.html

# Or serve locally
python3 -m http.server 8080
```

## Architecture

### index.html

Single-file static application with:
- **HTML**: Semantic structure with app bar, search, breadcrumb, stats, grid/tree views, detail panel
- **CSS**: CSS custom properties, responsive grid, MUI-inspired styling
- **JavaScript**: Vanilla JS with file structure data object, navigation, search, view toggling

### Key Features

1. **Dual View Modes**: Grid (cards) and Tree (hierarchical)
2. **Search**: Real-time filtering of files/folders
3. **Navigation**: Breadcrumb trail, folder click-through
4. **File Preview**: Slide-out panel with code preview
5. **Stats**: Folder/file counts, total size

### Data Structure

File structure defined in `fileStructure` object (~line 350):

```javascript
const fileStructure = {
    name: 'repo-name',
    type: 'folder',
    children: [
        { name: 'file.ts', type: 'file', size: 1200, ext: 'ts', preview: '...' },
        { name: 'folder', type: 'folder', children: [...] }
    ]
};
```

## Customization

To use with a different repository:
1. Generate file structure JSON from target repo
2. Replace `fileStructure` object in index.html
3. Update title/subtitle in app bar

## Tech Stack

- Pure HTML/CSS/JavaScript (no build tools)
- CSS Grid for responsive layout
- CSS custom properties for theming
