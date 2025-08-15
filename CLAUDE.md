# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` - Start development server on port 9000 with webpack-dev-server
- `npm run build` - Full build process (clean, build demo, commonjs, and ES modules)
- `npm run build-demo` - Build demo application only
- `npm run build-commonjs` - Build CommonJS modules to `lib/` directory
- `npm run build-es` - Build ES modules to `es/` directory
- `npm run clean` - Remove built files (`lib`, `es`, `demo/dist`)
- `npm run version` - Update version, build, and add to VCS (used for releases)

**Node.js Compatibility:** This project uses Webpack 4 which requires the legacy OpenSSL provider on Node.js 17+. If you encounter OpenSSL errors, use:
```bash
NODE_OPTIONS="--openssl-legacy-provider" npm start
NODE_OPTIONS="--openssl-legacy-provider" npm run build
```

## Architecture Overview

React-planner is a React component library for creating 2D floor plans with 3D visualization capabilities. The architecture follows a Redux-based state management pattern with immutable data structures.

### Core Architecture Components

**State Management:**
- Uses Redux with Immutable.js for all state management
- Central `State` model contains scene, catalog, viewer settings, and user interactions
- Actions are organized by domain: areas, groups, holes, items, lines, project, scene, vertices, viewer2d, viewer3d

**Main Application Structure:**
- `ReactPlanner` component is the main entry point that orchestrates Toolbar, Content, Sidebar, and FooterBar
- Uses React context to provide actions, translator, and catalog to child components
- Plugin system allows extending functionality (keyboard, autosave, console debugger)

**Scene Model:**
- `Scene` contains layers, grids, groups, and metadata
- `Layer` contains geometric elements: vertices, lines, holes, areas, items
- All elements inherit from shared attributes (id, type, properties, selection state)

**Element Types:**
- **Vertices**: Connection points for lines and areas
- **Lines**: Wall segments that can contain holes
- **Holes**: Openings in walls (doors, windows)
- **Areas**: Closed polygons representing rooms/spaces
- **Items**: Placeable objects (furniture, fixtures)

**Catalog System:**
- `Catalog` manages available elements and their properties
- Elements are organized into categories (windows, doors, etc.)
- Each element has configurable properties with default values
- Factory methods create instances with proper immutable structure

### Key Directories

- `src/actions/` - Redux actions organized by domain
- `src/components/` - React components organized by UI area (toolbar, sidebar, viewer2d, viewer3d)
- `src/reducers/` - Redux reducers matching action domains
- `src/class/` - Immutable Record classes for data models
- `src/utils/` - Utilities for geometry, graph operations, snapping, etc.
- `src/catalog/` - Catalog system and element factories
- `demo/src/catalog/` - Example catalog with walls, doors, windows, furniture

### Build Output

The library produces multiple build formats:
- CommonJS modules in `lib/` for Node.js compatibility
- ES modules in `es/` for modern bundlers
- Demo application in `demo/dist/` for GitHub Pages

### Key Technologies

- React 16.x with class components and context API
- Redux for state management with Immutable.js
- Three.js for 3D rendering
- SVG for 2D drawing
- Babel 6 for transpilation
- Webpack 4 for bundling

## SVG Export Feature

The project includes SVG export functionality that allows exporting floor plans as clickable SVG files:

### Custom ID Properties
- **Desks and Tables**: Include a `customId` property that can be set via the properties panel
- **All Elements**: Rendered with `data-custom-id`, `data-element-type`, and `data-element-id` attributes
- **Clickable Elements**: Each SVG element can be targeted for click events in external applications

### SVG Export Components
- `src/utils/svg-exporter.js` - Core export functionality that converts scene to SVG
- `src/components/toolbar/toolbar-svg-export-button.jsx` - Toolbar button component
- `src/actions/project-actions.js` - Contains `exportSvg()` action
- `src/reducers/project-reducer.js` - Handles `EXPORT_SVG` action

### Usage
1. Create a floor plan with desks, tables, and other elements
2. Set custom IDs on elements via the properties panel (optional)
3. Click the SVG export button in the toolbar
4. SVG file downloads automatically with clickable elements

### SVG Structure
```xml
<svg>
  <g class="floor-plan">
    <!-- Lines (walls) -->
    <line id="custom-id" data-element-type="line" data-custom-id="..." />
    
    <!-- Areas (rooms) -->
    <polygon id="custom-id" data-element-type="area" data-custom-id="..." />
    
    <!-- Items (furniture) -->
    <rect id="custom-id" data-element-type="item" data-custom-id="..." />
  </g>
</svg>
```

### Integration Notes
- Exported SVGs are self-contained and can be used in any web application
- Click event handlers can use `event.target.dataset.customId` to get element IDs
- Elements without custom IDs use auto-generated IDs like `desk-123` or `table-456`

## Resizable Elements

The project includes resizable elements perfect for creating office layouts:

### Office Space Element
- **Purpose**: Create labeled office areas/rooms like "STUDIO 1-2", "RECEPTION", etc.
- **Properties**: Width, Height, Color, Office Label, Custom ID
- **Default Size**: 200×150cm (easily resizable)
- **Visual Style**: Translucent colored rectangles with dashed borders
- **Usage**: Perfect for defining office spaces, conference rooms, reception areas

### Resizable Furniture
- **Bookcase**: Now has Width and Height properties (default 80×80cm)
- **Desk**: Fixed size (70×50cm) - optimal for individual workstations
- **Table**: Has Width and Depth properties for meeting tables

### Creating Office Layouts

**Two approaches available:**

#### Method 1: Simple Rectangular Offices (Office Space Items)
1. **Add Office Spaces**: Use the "Office Space" item from catalog 
2. **Customize Properties**: Width/Height, Office Label, Color, Custom ID
3. **Resize**: Edit Width/Height properties in the Properties panel

#### Method 2: Complex Shaped Offices (Office Areas) ⭐ **RECOMMENDED**
1. **Select "Office Area"** from the catalog (in Areas section)
2. **Draw by clicking points** to create any shape (L-shapes, irregular polygons, etc.)
3. **Reshape anytime**: Drag vertices to resize and modify the shape
4. **Set Properties**: Office Label, Custom ID, and choose area texture
5. **Perfect for complex layouts** like your L-shaped studios

### How to Create Complex Shapes (Office Areas):
1. Click **+** to open catalog → Go to **Areas** tab
2. Select **"Office Area"** 
3. **Click points** on the 2D view to define your office shape
4. **Press ESC** when done drawing
5. **Select the area** and set:
   - **Office Label**: "STUDIO 1-2", "RECEPTION", etc.
   - **Custom ID**: for click handling in your app
6. **Reshape**: Click and drag any vertex to modify the shape
7. **Add furniture** inside the area

### Font Improvements
- **Office labels** now use Arial font family
- **Larger, bolder text** (16px) with better letter spacing
- **Professional color scheme** (#2c3e50 for labels)
- **Consistent styling** in both 2D view and SVG export