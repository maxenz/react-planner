import ReactDOMServer from "react-dom/server";
import React from "react";

export function exportToSvg(scene, width = 800, height = 600) {
  const svgElements = [];

  // Get the selected layer (or default layer)
  const selectedLayer = scene.layers.get(scene.selectedLayer);
  if (!selectedLayer) return null;

  // Calculate bounds - start with extremes
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  // Render lines (walls and separators)
  selectedLayer.lines.forEach((line, lineId) => {
    const vertex1 = selectedLayer.vertices.get(line.vertices.get(0));
    const vertex2 = selectedLayer.vertices.get(line.vertices.get(1));

    if (vertex1 && vertex2) {
      const customId = line.properties.get("customId") || "";
      const elementId = customId || `line-${lineId}`;

      const x1 = vertex1.x;
      const y1 = -vertex1.y; // Flip Y
      const x2 = vertex2.x;
      const y2 = -vertex2.y; // Flip Y

      // Style based on line type
      let strokeColor = "#94a3b8";
      let strokeWidth = "4";
      let strokeDasharray = "";

      if (line.type === "internal-separator") {
        strokeColor = "#999999";
        strokeWidth = "2";
        strokeDasharray = "8,5";
      } else if (line.type === "wall") {
        strokeColor = "#94a3b8";
        strokeWidth = "4";
      }

      svgElements.push(
        <line
          key={`line-${lineId}`}
          id={elementId}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          data-element-type="line"
          data-element-id={lineId}
          data-custom-id={customId}
          data-line-type={line.type}
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
        const customId = hole.properties.get("customId") || "";
        const elementId = customId || `hole-${holeId}`;

        // Calculate hole position based on offset
        const lineLength = Math.sqrt(
          Math.pow(vertex2.x - vertex1.x, 2) +
            Math.pow(vertex2.y - vertex1.y, 2)
        );
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
      const customId = area.properties.get("customId") || "";
      const elementId = customId || `area-${areaId}`;

      const points = area.vertices
        .map((vertexId) => {
          const vertex = selectedLayer.vertices.get(vertexId);
          return vertex ? `${vertex.x},${-vertex.y}` : "";
        })
        .filter((p) => p)
        .join(" ");

      if (points) {
        // Calculate centroid for text placement
        let centerX = 0,
          centerY = 0;
        area.vertices.forEach((vertexId) => {
          const vertex = selectedLayer.vertices.get(vertexId);
          if (vertex) {
            centerX += vertex.x;
            centerY += vertex.y;
          }
        });
        centerX /= area.vertices.size;
        centerY /= area.vertices.size;

        // Determine if this is an office area and get custom properties
        const isOfficeArea = area.type === "office-area";
        const officeLabel = isOfficeArea
          ? area.properties.get("officeLabel") || "OFFICE"
          : "";

        svgElements.push(
          <polygon
            key={`area-${areaId}`}
            id={elementId}
            points={points}
            fill={
              isOfficeArea
                ? "#EEF3F9"
                : "#EEF3F9"
            }
            stroke={isOfficeArea ? "#666" : "none"}
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
        area.vertices.forEach((vertexId) => {
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

  // Sort items by z-index (bookable-unit should be on top)
  const itemsArray = selectedLayer.items.entrySeq().toArray();
  const sortedItems = itemsArray.sort(([idA, itemA], [idB, itemB]) => {
    // Bookable units should render last (highest z-index)
    if (itemA.type === "bookable-unit" && itemB.type !== "bookable-unit") return 1;
    if (itemB.type === "bookable-unit" && itemA.type !== "bookable-unit") return -1;
    return 0;
  });

  // Render items (furniture) in z-index order
  sortedItems.forEach(([itemId, item]) => {
    const customId = item.properties.get("customId") || "";
    const elementId = customId || `item-${itemId}`;

    // Get item dimensions from the catalog or use defaults
    let itemWidth = 70;
    let itemHeight = 50;

    // Handle different item types with their specific dimensions
    if (item.type === "desk") {
      itemWidth = 70;
      itemHeight = 50;
    } else if (item.properties.has("width") && item.properties.has("height")) {
      // For items with width/height properties (office-space, bookcase)
      itemWidth = item.properties.get("width").get
        ? item.properties.get("width").get("length")
        : item.properties.get("width");
      itemHeight = item.properties.get("height").get
        ? item.properties.get("height").get("length")
        : item.properties.get("height");
    } else if (item.properties.has("width") && item.properties.has("depth")) {
      // For items like tables with width/depth properties
      itemWidth = item.properties.get("width").get
        ? item.properties.get("width").get("length")
        : item.properties.get("width");
      itemHeight = item.properties.get("depth").get
        ? item.properties.get("depth").get("length")
        : item.properties.get("depth");
    }

    // Calculate positioning and rotation
    const x = item.x - itemWidth / 2;
    const y = -item.y - itemHeight / 2; // Flip Y coordinate
    const rotation = item.rotation || 0;

    // Handle special rendering for complex furniture items
    if (
      item.type === "office desk" ||
      item.type === "table with chairs (4 person)" ||
      item.type === "table with chairs (6 person)"
    ) {
      // For these items, use custom SVG rendering to show chairs
      const renderComplexFurniture = (
        item,
        itemId,
        elementId,
        customId,
        x,
        y,
        itemWidth,
        itemHeight
      ) => {
        const elements = [];
        const chairSize = 25;
        const chairOffset = 0;

        if (item.type === "office desk") {
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
        } else if (item.type === "table with chairs (4 person)") {
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

          // Add chairs around the table (touching the table)
          const chairPositions = [
            { x: item.x, y: -item.y + itemHeight / 2 + chairSize / 2 }, // top
            { x: item.x, y: -item.y - itemHeight / 2 - chairSize / 2 }, // bottom
            { x: item.x + itemWidth / 2 + chairSize / 2, y: -item.y }, // right
            { x: item.x - itemWidth / 2 - chairSize / 2, y: -item.y }, // left
          ];

          chairPositions.forEach((pos, i) => {
            elements.push(
              <rect
                key={`chair-${itemId}-${i}`}
                x={pos.x - chairSize / 2}
                y={pos.y - chairSize / 2}
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
        } else if (item.type === "table with chairs (6 person)") {
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

          // Add 6 chairs around the table (touching the table)
          const chairPositions = [
            { x: item.x, y: -item.y + itemHeight / 2 + chairSize / 2 }, // top center
            { x: item.x, y: -item.y - itemHeight / 2 - chairSize / 2 }, // bottom center
            {
              x: item.x + itemWidth / 2 + chairSize / 2,
              y: -item.y + itemHeight / 4,
            }, // right 1
            {
              x: item.x + itemWidth / 2 + chairSize / 2,
              y: -item.y - itemHeight / 4,
            }, // right 2
            {
              x: item.x - itemWidth / 2 - chairSize / 2,
              y: -item.y + itemHeight / 4,
            }, // left 1
            {
              x: item.x - itemWidth / 2 - chairSize / 2,
              y: -item.y - itemHeight / 4,
            }, // left 2
          ];

          chairPositions.forEach((pos, i) => {
            elements.push(
              <rect
                key={`chair-${itemId}-${i}`}
                x={pos.x - chairSize / 2}
                y={pos.y - chairSize / 2}
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

      const complexElements = renderComplexFurniture(
        item,
        itemId,
        elementId,
        customId,
        x,
        y,
        itemWidth,
        itemHeight
      );
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
    let fillColor = "#EEF3F9";
    let strokeColor = "#000000";
    let strokeWidth = "2";
    let fillOpacity = "1";
    let strokeDasharray = "";
    let textLabel = item.type;
    let isCircular = false;

    if (item.type === "office-space") {
      fillColor = item.properties.get("color") || "#e8f4f8";
      fillOpacity = "0.3";
      strokeColor = "none";
      strokeWidth = "0";
      strokeDasharray = "";
      textLabel = item.properties.get("label") || "OFFICE";
    } else if (item.type === "background-area") {
      fillColor = item.properties.get("color") || "#e8f4f8";
      fillOpacity = item.properties.get("opacity") || 0.3;
      strokeColor = "none";
      strokeWidth = "0";
      strokeDasharray = "";
      textLabel = ""; // No text for background areas
    } else if (item.type === "coffee-area") {
      fillColor = "#8db4d3";
      strokeColor = "#6b9dc4";
      strokeWidth = "2";
      fillOpacity = "1";
      textLabel = "";
      isCircular = true;
    } else if (
      item.type === "bathroom-area" ||
      item.type === "phonebooth-area"
    ) {
      fillColor = "#a8c8e1";
      strokeColor = "#7ba7c7";
      strokeWidth = "2";
      fillOpacity = "1";
      textLabel = "";
      isCircular = true;
    } else if (item.type === "bookable-unit") {
      fillColor = "#e8f4f8";
      strokeColor = "#7ba7c7";
      strokeWidth = "2";
      fillOpacity = "1";
      textLabel = "";
      isCircular = true;
    } else if (item.type === "table") {
      fillColor = "white";
      strokeColor = "#000000";
      strokeWidth = "2";
      fillOpacity = "1";
      textLabel = "";
      
      // Check if it's a circular table
      const shape = item.properties && item.properties.get ? item.properties.get("shape") : "rectangular";
      if (shape === "circular") {
        isCircular = true;
      }
      
      // For rectangular tables, render with proper rotation
      if (!isCircular) {
        const transform = rotation !== 0 ? `rotate(${-rotation} ${item.x} ${-item.y})` : "";
        
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
            transform={transform}
            data-element-type="item"
            data-element-id={itemId}
            data-custom-id={customId}
            data-item-type={item.type}
          />
        );

        // Update bounds
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + itemWidth);
        maxY = Math.max(maxY, y + itemHeight);

        // Skip the default rendering below
        return;
      }
    } else if (item.type === "label") {
      // Label is text-only, no background shape
      fillColor = "none";
      strokeColor = "none";
      strokeWidth = "0";
      fillOpacity = "0";
      textLabel = item.properties.get("text") || "LABEL";
    }

    if (item.type === "label") {
      // For labels, only render text, no background shape
      // Update bounds minimally for text
      minX = Math.min(minX, item.x - 50);
      minY = Math.min(minY, -item.y - 10);
      maxX = Math.max(maxX, item.x + 50);
      maxY = Math.max(maxY, -item.y + 10);
    } else if (isCircular) {
      // Render circular items
      let radius = 30;
      if (item.type === "bookable-unit") {
        radius = 10;
      } else if (item.type === "table") {
        // For circular tables, use diameter property
        const diameter = item.properties && item.properties.get ? 
          (item.properties.get("diameter") ? 
            (item.properties.get("diameter").get ? item.properties.get("diameter").get("length") : item.properties.get("diameter")) 
            : 80) 
          : 80;
        radius = diameter / 2;
      }
      svgElements.push(
        <g key={`item-${itemId}`}>
          <circle
            id={elementId}
            cx={item.x}
            cy={-item.y}
            r={radius}
            fill={fillColor}
            fillOpacity={fillOpacity}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            data-element-type="item"
            data-element-id={itemId}
            data-custom-id={customId}
            data-item-type={item.type}
            data-availability={
              item.type === "bookable-unit" &&
              item.properties &&
              item.properties.get
                ? item.properties.get("availability") || "available"
                : undefined
            }
          />

          {/* Add icon paths based on item type */}
          {item.type === "coffee-area" && (
            <g
              transform={`translate(${
                item.x
              }, ${-item.y}) scale(0.8, 0.8) translate(-375, -375)`}
            >
              <path
                d="M374.7,358.984c-9.3,0-16.9,7.6-16.9,16.9s7.6,16.9,16.9,16.9,16.9-7.6,16.9-16.9-7.6-16.9-16.9-16.9ZM377.604,364.502l-.042-.043c-.222-.223-.222-.586,0-.809.222-.224.581-.224.802,0l.042.043c1.345,1.357,1.345,3.565,0,4.922-.438.441-.678,1.028-.678,1.652s.241,1.211.678,1.652c.222.224.222.586,0,.809-.111.112-.256.168-.401.168s-.29-.056-.401-.167c-.652-.657-1.011-1.531-1.011-2.461,0-.93.359-1.804,1.011-2.461.903-.911.903-2.393,0-3.304ZM374.321,364.502l-.042-.043c-.222-.223-.222-.586,0-.809.222-.224.581-.224.802,0l.042.043c.652.657,1.011,1.531,1.011,2.461s-.359,1.804-1.011,2.461c-.438.441-.678,1.028-.678,1.652s.241,1.211.678,1.652c.222.223.222.586,0,.809-.111.112-.256.168-.401.168s-.29-.056-.401-.168c-.652-.657-1.011-1.531-1.011-2.461s.359-1.804,1.011-2.461c.438-.441.678-1.028.678-1.652s-.241-1.211-.678-1.652ZM371.037,364.502l-.042-.043c-.222-.223-.222-.586,0-.809.222-.224.581-.224.802,0l.042.043c1.345,1.357,1.345,3.565,0,4.922-.438.441-.678,1.028-.678,1.652s.241,1.211.678,1.652c.222.223.222.586,0,.809-.111.112-.256.168-.401.168s-.29-.056-.401-.168c-.652-.657-1.011-1.531-1.011-2.461,0-.93.359-1.804,1.011-2.461.903-.911.903-2.393,0-3.304ZM386.3,385.679h-23.201c-.313,0-.567-.256-.567-.572s.254-.572.567-.572h6.73c-1.982-1.286-3.3-3.528-3.3-6.077v-3.878c0-.316.254-.572.567-.572h15.204c.313,0,.567.256.567.572v1.43h1.105c1.548,0,2.808,1.271,2.808,2.832s-1.26,2.832-2.808,2.832h-1.857c-.579,1.169-1.464,2.158-2.547,2.861h6.73c.313,0,.567.256.567.572s-.254.572-.567.572Z"
                fill="white"
                stroke="none"
              />
            </g>
          )}

          {item.type === "bathroom-area" && (
            <g
              transform={`translate(${
                item.x
              }, ${-item.y}) scale(0.8, 0.8) translate(-1030, -410)`}
            >
              <path
                d="M1030.117,394.786c9.267,0,16.778,7.511,16.778,16.778s-7.511,16.778-16.778,16.778-16.778-7.511-16.778-16.778,7.511-16.778,16.778-16.778h0ZM1022.318,423.852c.158.094.18.201.338.309.122.086.288.158.489.18.396.043.971.014,1.389.007h7.835l2.662-.007c.468-.058.619-.302.842-.568.173-.612.101-.64-.029-1.245-.086-.396-.209-.863-.266-1.252l-.784-3.626c.388-.043,3.763-.014,4.468-.014,1.014,0,2.813.266,2.806-1.727-.022-3.014-.014-6.029-.014-9.036-1.108.187-2.461.101-3.633.101h-3.763c-.043.489-.014,2.626-.014,3.281,0,1.036.043,2.166-.101,3.173-.331,2.324-1.475,4.144-3.065,5.54-.072.065-.129.108-.23.187-.151.122-.309.23-.482.36-1.856,1.345-4.302,1.777-6.612,1.554-.525-.05-.942-.173-1.432-.245-.173.317-.252,1.086-.345,1.489-.058.252-.115.489-.158.734-.086.446.058.496.101.806h0ZM1032.398,411.535h-15.281c-.144,2.338.669,4.482,2.216,6.123.288.302.741.676,1.13.935,1.568,1.058,2.842,1.446,4.871,1.446,1.309,0,2.417-.173,3.504-.669,3-1.374,4.95-4.381,4.712-7.835h-1.151ZM1037.7,399.175c-.324.266-.36.245-.525.748-.05,1.115.446.237.324,1.935l-2.964.007c-.475.079-.547.367-.547.871l.007,2.619c.137.705.777.547,1.504.547h6.209c.827-.007.719-.626.719-1.338,0-3.295.511-2.655-3.259-2.698-.029,0-.094,0-.122-.007l-.101-.029c-.007,0-.022-.007-.029-.014-.007-.799-.086-.82.108-1.079.101-.129.187-.317.209-.496.036-.281-.029-.568-.173-.755-.288-.381-.791-.532-1.36-.309h0ZM1029.808,410.557h2.374c.022-.863.144-1.691-.345-2.194-.209-.216-.216-.18-.475-.338l-.324-.101c-.324.079-1.827.029-2.273.029h-2.281c-1.532-.007-3.101-.022-4.633.007-.741.007-2.259-.137-2.784.201-.259.165-.525.518-.568.942s-.007.993-.007,1.453h11.317Z"
                fill="white"
                stroke="none"
              />
            </g>
          )}
          {item.type === "phonebooth-area" && (
            <g transform={`translate(${item.x}, ${-item.y})`}>
              <path
                d="M64 160C64 124.7 92.7 96 128 96L512 96C547.3 96 576 124.7 576 160L576 480C576 515.3 547.3 544 512 544L224 544L224 240C224 195.8 188.2 160 144 160L64 160zM312 384C325.3 384 336 373.3 336 360C336 346.7 325.3 336 312 336C298.7 336 288 346.7 288 360C288 373.3 298.7 384 312 384zM312 480C325.3 480 336 469.3 336 456C336 442.7 325.3 432 312 432C298.7 432 288 442.7 288 456C288 469.3 298.7 480 312 480zM424 360C424 346.7 413.3 336 400 336C386.7 336 376 346.7 376 360C376 373.3 386.7 384 400 384C413.3 384 424 373.3 424 360zM400 480C413.3 480 424 469.3 424 456C424 442.7 413.3 432 400 432C386.7 432 376 442.7 376 456C376 469.3 386.7 480 400 480zM512 360C512 346.7 501.3 336 488 336C474.7 336 464 346.7 464 360C464 373.3 474.7 384 488 384C501.3 384 512 373.3 512 360zM488 480C501.3 480 512 469.3 512 456C512 442.7 501.3 432 488 432C474.7 432 464 442.7 464 456C474.7 480 488 480zM320 160C302.3 160 288 174.3 288 192L288 224C288 241.7 302.3 256 320 256L480 256C497.7 256 512 241.7 512 224L512 192C512 174.3 497.7 160 480 160L320 160zM96 208L144 208C161.7 208 176 222.3 176 240L176 512C176 529.7 161.7 544 144 544L96 544C78.3 544 64 529.7 64 512L64 240C64 222.3 78.3 208 96 208z"
                fill="white"
                stroke="none"
                transform="scale(0.06, -0.06) translate(-320, -320)"
              />
            </g>
          )}
          {item.type === "bookable-unit" && (
            <g transform={`translate(${item.x}, ${-item.y})`}>
              {/* Inner availability indicator circle */}
              <circle
                cx="0"
                cy="0"
                r="8"
                fill={
                  item.properties &&
                  item.properties.get &&
                  item.properties.get("availability") === "unavailable"
                    ? "#ef4444"
                    : "#22c55e"
                }
                stroke="none"
              />
            </g>
          )}
        </g>
      );

      // Update bounds for circular items
      minX = Math.min(minX, item.x - radius);
      minY = Math.min(minY, -item.y - radius);
      maxX = Math.max(maxX, item.x + radius);
      maxY = Math.max(maxY, -item.y + radius);
    } else {
      // Render rectangular items with rotation support
      const transform = rotation !== 0 ? `rotate(${-rotation} ${item.x} ${-item.y})` : "";
      
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
          transform={transform}
          data-element-type="item"
          data-element-id={itemId}
          data-custom-id={customId}
          data-item-type={item.type}
        />
      );

      // Update bounds using the actual rectangle coordinates
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + itemWidth);
      maxY = Math.max(maxY, y + itemHeight);
    }

    // Add text label (if there is text to show)
    if (textLabel) {
      let fontSize = "12";
      let fontWeight = "normal";
      let fontFamily = "inherit";
      let textColor = "#333333";
      let letterSpacing = "normal";

      if (item.type === "office-space") {
        fontSize = "16";
        fontWeight = "bold";
        fontFamily = "Arial, Helvetica, sans-serif";
        textColor = "#2c3e50";
        letterSpacing = "0.5px";
      } else if (item.type === "label") {
        fontSize = item.properties.get("fontSize")
          ? item.properties.get("fontSize").get("length")
          : "16";
        fontWeight = "bold";
        fontFamily = "Arial, Helvetica, sans-serif";
        textColor = item.properties.get("color") || "#2c3e50";
        letterSpacing = "0.5px";
      }

      svgElements.push(
        <text
          key={`item-text-${itemId}`}
          x={item.x}
          y={-item.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          fontWeight={fontWeight}
          fontFamily={fontFamily}
          fill={textColor}
          letterSpacing={letterSpacing}
          pointerEvents="none"
        >
          {textLabel}
        </text>
      );
    }
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
      style={{ background: "white" }}
    >
      <defs>
        <style>
          {`
            .clickable { cursor: pointer; }
            .clickable:hover { opacity: 0.8; }
          `}
        </style>
      </defs>
      <g className="floor-plan">{svgElements}</g>
    </svg>
  );

  // Convert to string
  const svgString = ReactDOMServer.renderToStaticMarkup(svgElement);

  return {
    svg: svgString,
    width: svgWidth,
    height: svgHeight,
    bounds: { minX, minY, maxX, maxY },
  };
}

export function downloadSvg(svgData, filename = "floor-plan.svg") {
  const blob = new Blob([svgData.svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
