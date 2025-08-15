import ReactDOMServer from 'react-dom/server';
import React from 'react';

export function exportToSvg(scene, width = 800, height = 600) {
  const svgElements = [];
  
  // Get the selected layer (or default layer)
  const selectedLayer = scene.layers.get(scene.selectedLayer);
  if (!selectedLayer) return null;

  // Calculate bounds - start with extremes
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  // Render lines (walls)
  selectedLayer.lines.forEach((line, lineId) => {
    const vertex1 = selectedLayer.vertices.get(line.vertices.get(0));
    const vertex2 = selectedLayer.vertices.get(line.vertices.get(1));
    
    if (vertex1 && vertex2) {
      const customId = line.properties.get('customId') || '';
      const elementId = customId || `line-${lineId}`;
      
      const x1 = vertex1.x;
      const y1 = -vertex1.y; // Flip Y
      const x2 = vertex2.x;
      const y2 = -vertex2.y; // Flip Y
      
      svgElements.push(
        <line
          key={`line-${lineId}`}
          id={elementId}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#000000"
          strokeWidth="2"
          data-element-type="line"
          data-element-id={lineId}
          data-custom-id={customId}
        />
      );
      
      // Update bounds using flipped coordinates
      minX = Math.min(minX, x1, x2);
      minY = Math.min(minY, y1, y2);
      maxX = Math.max(maxX, x1, x2);
      maxY = Math.max(maxY, y1, y2);
    }
  });

  // Render holes (doors/windows)
  selectedLayer.holes.forEach((hole, holeId) => {
    const line = selectedLayer.lines.get(hole.line);
    if (line) {
      const vertex1 = selectedLayer.vertices.get(line.vertices.get(0));
      const vertex2 = selectedLayer.vertices.get(line.vertices.get(1));
      
      if (vertex1 && vertex2) {
        const customId = hole.properties.get('customId') || '';
        const elementId = customId || `hole-${holeId}`;
        
        // Calculate hole position based on offset
        const lineLength = Math.sqrt(Math.pow(vertex2.x - vertex1.x, 2) + Math.pow(vertex2.y - vertex1.y, 2));
        const t = hole.offset / lineLength;
        const holeX = vertex1.x + t * (vertex2.x - vertex1.x);
        const holeY = vertex1.y + t * (vertex2.y - vertex1.y);
        const svgHoleY = -holeY; // Flip Y for SVG
        
        svgElements.push(
          <circle
            key={`hole-${holeId}`}
            id={elementId}
            cx={holeX}
            cy={svgHoleY}
            r="10"
            fill="#ff6b6b"
            stroke="#000000"
            strokeWidth="1"
            data-element-type="hole"
            data-element-id={holeId}
            data-custom-id={customId}
          />
        );
        
        // Update bounds using SVG coordinates
        minX = Math.min(minX, holeX - 10);
        minY = Math.min(minY, svgHoleY - 10);
        maxX = Math.max(maxX, holeX + 10);
        maxY = Math.max(maxY, svgHoleY + 10);
      }
    }
  });

  // Render areas (rooms)
  selectedLayer.areas.forEach((area, areaId) => {
    if (area.vertices && area.vertices.size > 0) {
      const customId = area.properties.get('customId') || '';
      const elementId = customId || `area-${areaId}`;
      
      const points = area.vertices.map(vertexId => {
        const vertex = selectedLayer.vertices.get(vertexId);
        return vertex ? `${vertex.x},${-vertex.y}` : '';
      }).filter(p => p).join(' ');
      
      if (points) {
        // Calculate centroid for text placement
        let centerX = 0, centerY = 0;
        area.vertices.forEach(vertexId => {
          const vertex = selectedLayer.vertices.get(vertexId);
          if (vertex) {
            centerX += vertex.x;
            centerY += vertex.y;
          }
        });
        centerX /= area.vertices.size;
        centerY /= area.vertices.size;

        // Determine if this is an office area and get custom properties
        const isOfficeArea = area.type === 'office-area';
        const officeLabel = isOfficeArea ? (area.properties.get('officeLabel') || 'OFFICE') : '';
        
        svgElements.push(
          <polygon
            key={`area-${areaId}`}
            id={elementId}
            points={points}
            fill={isOfficeArea ? "rgba(132, 225, 206, 0.2)" : "rgba(132, 225, 206, 0.3)"}
            stroke={isOfficeArea ? "#666" : "#84e1ce"}
            strokeWidth={isOfficeArea ? "2" : "1"}
            strokeDasharray={isOfficeArea ? "5,5" : ""}
            data-element-type="area"
            data-element-id={areaId}
            data-custom-id={customId}
            data-area-type={area.type}
          />
        );

        // Add label for office areas
        if (isOfficeArea && officeLabel) {
          svgElements.push(
            <text
              key={`area-text-${areaId}`}
              x={centerX}
              y={-centerY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="16"
              fontWeight="bold"
              fontFamily="Arial, Helvetica, sans-serif"
              fill="#2c3e50"
              letterSpacing="0.5px"
              pointerEvents="none"
            >
              {officeLabel}
            </text>
          );
        }
        
        // Update bounds based on vertices using SVG coordinates
        area.vertices.forEach(vertexId => {
          const vertex = selectedLayer.vertices.get(vertexId);
          if (vertex) {
            minX = Math.min(minX, vertex.x);
            minY = Math.min(minY, -vertex.y); // Use flipped Y for bounds
            maxX = Math.max(maxX, vertex.x);
            maxY = Math.max(maxY, -vertex.y); // Use flipped Y for bounds
          }
        });
      }
    }
  });

  // Render items (furniture)
  selectedLayer.items.forEach((item, itemId) => {
    const customId = item.properties.get('customId') || '';
    const elementId = customId || `item-${itemId}`;
    
    // Get item dimensions from the catalog or use defaults
    let itemWidth = 70;
    let itemHeight = 50;
    
    // Handle different item types with their specific dimensions
    if (item.type === 'desk') {
      itemWidth = 70;
      itemHeight = 50;
    } else if (item.properties.has('width') && item.properties.has('height')) {
      // For items with width/height properties (office-space, bookcase)
      itemWidth = item.properties.get('width').get ? item.properties.get('width').get('length') : item.properties.get('width');
      itemHeight = item.properties.get('height').get ? item.properties.get('height').get('length') : item.properties.get('height');
    } else if (item.properties.has('width') && item.properties.has('depth')) {
      // For items like tables with width/depth properties
      itemWidth = item.properties.get('width').get ? item.properties.get('width').get('length') : item.properties.get('width');
      itemHeight = item.properties.get('depth').get ? item.properties.get('depth').get('length') : item.properties.get('depth');
    }
    
    // Simple rectangle positioning without complex transforms
    const x = item.x - itemWidth / 2;
    const y = -item.y - itemHeight / 2; // Flip Y coordinate
    
    // Handle special rendering for complex furniture items
    if (item.type === 'office desk' || item.type === 'table with chairs (4 person)' || item.type === 'table with chairs (6 person)') {
      // For these items, use custom SVG rendering to show chairs
      const renderComplexFurniture = (item, itemId, elementId, customId, x, y, itemWidth, itemHeight) => {
        const elements = [];
        const chairSize = 25;
        const chairOffset = 8;
        
        if (item.type === 'office desk') {
          // Render circular desk
          const radius = Math.min(itemWidth, itemHeight) / 2;
          elements.push(
            <circle
              key={`item-${itemId}`}
              id={elementId}
              cx={item.x}
              cy={-item.y}
              r={radius}
              fill="#8B4513"
              fillOpacity="0.8"
              stroke="#2c3e50"
              strokeWidth="2"
              data-element-type="item"
              data-element-id={itemId}
              data-custom-id={customId}
              data-item-type={item.type}
            />
          );
          elements.push(
            <circle
              key={`item-inset-${itemId}`}
              cx={item.x}
              cy={-item.y}
              r={radius * 0.7}
              fill="none"
              stroke="#654321"
              strokeWidth="1"
              opacity="0.6"
            />
          );
          elements.push(
            <text
              key={`item-text-${itemId}`}
              x={item.x}
              y={-item.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#fff"
            >
              DESK
            </text>
          );
        } else if (item.type === 'table with chairs (4 person)') {
          // Render square table with 4 chairs
          elements.push(
            <rect
              key={`item-${itemId}`}
              id={elementId}
              x={x}
              y={y}
              width={itemWidth}
              height={itemHeight}
              fill="#9b8c75"
              fillOpacity="0.9"
              stroke="#2c3e50"
              strokeWidth="2"
              data-element-type="item"
              data-element-id={itemId}
              data-custom-id={customId}
              data-item-type={item.type}
            />
          );
          
          // Add chairs around the table
          const chairPositions = [
            { x: item.x, y: -item.y + itemHeight/2 + chairSize + chairOffset }, // top
            { x: item.x, y: -item.y - itemHeight/2 - chairSize - chairOffset }, // bottom
            { x: item.x + itemWidth/2 + chairSize + chairOffset, y: -item.y }, // right
            { x: item.x - itemWidth/2 - chairSize - chairOffset, y: -item.y }  // left
          ];
          
          chairPositions.forEach((pos, i) => {
            elements.push(
              <rect
                key={`chair-${itemId}-${i}`}
                x={pos.x - chairSize/2}
                y={pos.y - chairSize/2}
                width={chairSize}
                height={chairSize}
                fill="#666"
                fillOpacity="0.8"
                stroke="#333"
                strokeWidth="1"
              />
            );
          });
          
          elements.push(
            <text
              key={`item-text-${itemId}`}
              x={item.x}
              y={-item.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fontWeight="bold"
              fill="#fff"
            >
              TABLE
            </text>
          );
        } else if (item.type === 'table with chairs (6 person)') {
          // Render rectangular table with 6 chairs
          elements.push(
            <rect
              key={`item-${itemId}`}
              id={elementId}
              x={x}
              y={y}
              width={itemWidth}
              height={itemHeight}
              fill="#9b8c75"
              fillOpacity="0.9"
              stroke="#2c3e50"
              strokeWidth="2"
              data-element-type="item"
              data-element-id={itemId}
              data-custom-id={customId}
              data-item-type={item.type}
            />
          );
          
          // Add 6 chairs around the table
          const chairPositions = [
            { x: item.x, y: -item.y + itemHeight/2 + chairSize + chairOffset }, // top center
            { x: item.x, y: -item.y - itemHeight/2 - chairSize - chairOffset }, // bottom center
            { x: item.x + itemWidth/2 + chairSize + chairOffset, y: -item.y + itemHeight/4 }, // right 1
            { x: item.x + itemWidth/2 + chairSize + chairOffset, y: -item.y - itemHeight/4 }, // right 2
            { x: item.x - itemWidth/2 - chairSize - chairOffset, y: -item.y + itemHeight/4 }, // left 1
            { x: item.x - itemWidth/2 - chairSize - chairOffset, y: -item.y - itemHeight/4 }  // left 2
          ];
          
          chairPositions.forEach((pos, i) => {
            elements.push(
              <rect
                key={`chair-${itemId}-${i}`}
                x={pos.x - chairSize/2}
                y={pos.y - chairSize/2}
                width={chairSize}
                height={chairSize}
                fill="#666"
                fillOpacity="0.8"
                stroke="#333"
                strokeWidth="1"
              />
            );
          });
          
          elements.push(
            <text
              key={`item-text-${itemId}`}
              x={item.x}
              y={-item.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fontWeight="bold"
              fill="#fff"
            >
              TABLE
            </text>
          );
        }
        
        return elements;
      };
      
      const complexElements = renderComplexFurniture(item, itemId, elementId, customId, x, y, itemWidth, itemHeight);
      svgElements.push(...complexElements);
      
      // Update bounds
      const padding = 50; // Account for chairs
      minX = Math.min(minX, x - padding);
      minY = Math.min(minY, y - padding);
      maxX = Math.max(maxX, x + itemWidth + padding);
      maxY = Math.max(maxY, y + itemHeight + padding);
      
      return; // Skip the standard rectangle rendering
    }
    
    // Handle special styling for other item types
    let fillColor = "#84e1ce";
    let strokeColor = "#000000";
    let strokeWidth = "2";
    let fillOpacity = "1";
    let strokeDasharray = "";
    let textLabel = item.type;
    
    if (item.type === 'office-space') {
      fillColor = item.properties.get('color') || '#e8f4f8';
      fillOpacity = "0.3";
      strokeDasharray = "5,5";
      textLabel = item.properties.get('label') || 'OFFICE';
    }

    svgElements.push(
      <rect
        key={`item-${itemId}`}
        id={elementId}
        x={x}
        y={y}
        width={itemWidth}
        height={itemHeight}
        fill={fillColor}
        fillOpacity={fillOpacity}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        data-element-type="item"
        data-element-id={itemId}
        data-custom-id={customId}
        data-item-type={item.type}
      />
    );
    
    // Add text label
    svgElements.push(
      <text
        key={`item-text-${itemId}`}
        x={item.x}
        y={-item.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={item.type === 'office-space' ? '16' : '12'}
        fontWeight={item.type === 'office-space' ? 'bold' : 'normal'}
        fontFamily={item.type === 'office-space' ? 'Arial, Helvetica, sans-serif' : 'inherit'}
        fill={item.type === 'office-space' ? '#2c3e50' : '#333333'}
        letterSpacing={item.type === 'office-space' ? '0.5px' : 'normal'}
        pointerEvents="none"
      >
        {textLabel}
      </text>
    );
    
    // Update bounds using the actual rectangle coordinates
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + itemWidth);
    maxY = Math.max(maxY, y + itemHeight);
  });

  // Handle case where no elements exist
  if (minX === Infinity) {
    minX = 0;
    minY = 0;
    maxX = 800;
    maxY = 600;
  }

  // Add padding
  const padding = 50;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const svgWidth = maxX - minX;
  const svgHeight = maxY - minY;

  // Create the SVG element
  const svgElement = (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`${minX} ${minY} ${svgWidth} ${svgHeight}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{background: 'white'}}
    >
      <defs>
        <style>
          {`
            .clickable { cursor: pointer; }
            .clickable:hover { opacity: 0.8; }
          `}
        </style>
      </defs>
      <g className="floor-plan">
        {svgElements}
      </g>
    </svg>
  );

  // Convert to string
  const svgString = ReactDOMServer.renderToStaticMarkup(svgElement);
  
  return {
    svg: svgString,
    width: svgWidth,
    height: svgHeight,
    bounds: { minX, minY, maxX, maxY }
  };
}

export function downloadSvg(svgData, filename = 'floor-plan.svg') {
  const blob = new Blob([svgData.svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}