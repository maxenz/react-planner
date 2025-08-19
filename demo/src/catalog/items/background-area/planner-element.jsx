import React from "react";

export default {
  name: "background-area",
  prototype: "items",

  info: {
    tag: ["background", "area", "color", "fill"],
    title: "Background Area",
    description: "Resizable background color area for floor plans",
    image: require("./background-area.png"),
  },

  properties: {
    width: {
      label: "Width",
      type: "length-measure",
      defaultValue: {
        length: 150,
        unit: "cm",
      },
    },
    height: {
      label: "Height",
      type: "length-measure",
      defaultValue: {
        length: 100,
        unit: "cm",
      },
    },
    color: {
      label: "Background Color",
      type: "color",
      defaultValue: "#EEF3F9",
    },
    opacity: {
      label: "Opacity",
      type: "number",
      defaultValue: 0.3,
      min: 0.1,
      max: 1.0,
      step: 0.1,
    },
    customId: {
      label: "Custom ID",
      type: "string",
      defaultValue: "",
    },
    altitude: {
      label: "Altitude",
      type: "length-measure",
      defaultValue: {
        length: 0,
        unit: "cm",
      },
    },
  },

  render2D: function (element, layer, scene) {
    const width = element.properties.get("width").get("length");
    const height = element.properties.get("height").get("length");
    const color = element.properties.get("color");
    const opacity = element.properties.get("opacity") || 0.3;
    const customId = element.properties.get("customId") || "";
    const elementId = customId || `bg-${element.id}`;

    const rectStyle = {
      stroke: element.selected ? "#0096fd" : "none",
      strokeWidth: element.selected ? "2px" : "0",
      fill: color,
      fillOpacity: opacity,
    };

    return (
      <g transform={`translate(${-width / 2}, ${-height / 2})`}>
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          id={elementId}
          data-custom-id={customId}
          data-element-type="item"
          data-element-id={element.id}
          style={rectStyle}
        />
        {/* Small indicator dot when selected to show it's not just empty space */}
        {element.selected && (
          <circle
            cx={width / 2}
            cy={height / 2}
            r="3"
            fill="#0096fd"
            fillOpacity="0.8"
          />
        )}
      </g>
    );
  },

  render3D: function (element, layer, scene) {
    // For 3D, create a simple flat plane representing the background area
    const width = element.properties.get("width").get("length");
    const height = element.properties.get("height").get("length");
    const altitude = element.properties.get("altitude").get("length");
    const color = element.properties.get("color");
    const opacity = element.properties.get("opacity") || 0.3;

    const Three = require("three");

    // Create a flat plane geometry for the background area
    const geometry = new Three.PlaneGeometry(width / 100, height / 100); // Convert cm to meters
    geometry.rotateX(-Math.PI / 2); // Make it lie flat on the ground

    const material = new Three.MeshLambertMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
      side: Three.DoubleSide,
    });

    const mesh = new Three.Mesh(geometry, material);
    mesh.position.y = altitude / 100 + 0.01; // Slightly above ground to avoid z-fighting

    if (element.selected) {
      const bbox = new Three.BoxHelper(mesh, 0x99c3fb);
      bbox.material.linewidth = 5;
      bbox.renderOrder = 1000;
      bbox.material.depthTest = false;
      mesh.add(bbox);
    }

    return Promise.resolve(mesh);
  },
};
