import React from "react";

export default {
  name: "phonebooth-area",
  prototype: "items",

  info: {
    tag: ["phone", "phonebooth"],
    title: "Phonebooth",
    description: "Phonebooth area with circular icon",
    image: require("./phonebooth-icon.svg"),
  },

  properties: {
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
    const customId = element.properties.get("customId") || "";
    const elementId = customId || `phonebooth-${element.id}`;
    const radius = 30;

    const circleStyle = {
      fill: "#a8c8e1",
      stroke: element.selected ? "#0096fd" : "#7ba7c7",
      strokeWidth: element.selected ? "3px" : "2px",
    };

    return (
      <g>
        {/* Circle background */}
        <circle
          cx="0"
          cy="0"
          r={radius}
          id={elementId}
          data-custom-id={customId}
          data-element-type="item"
          data-element-id={element.id}
          style={circleStyle}
        />

        {/* Phonebooth icon from SVG file */}
        <image
          x="-20"
          y="-20"
          width="40"
          height="40"
          href={require("./phonebooth-icon.svg")}
          style={{ filter: element.selected ? "brightness(1.2)" : "none" }}
        />
      </g>
    );
  },

  render3D: function (element, layer, scene) {
    const Three = require("three");

    // Create a cylinder for the bathroom area
    const geometry = new Three.CylinderGeometry(0.3, 0.3, 0.05, 32);
    const material = new Three.MeshLambertMaterial({
      color: "#a8c8e1",
      transparent: true,
      opacity: 0.8,
    });

    const mesh = new Three.Mesh(geometry, material);
    mesh.position.y = 0.025;

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
