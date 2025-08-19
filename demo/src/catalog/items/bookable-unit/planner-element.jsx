import React from "react";

export default {
  name: "bookable-unit",
  prototype: "items",

  info: {
    tag: ["booking", "unit", "availability"],
    title: "Bookable Unit",
    description: "Bookable unit with availability indicator",
    image: require("./bookable-unit-icon.svg"),
  },

  properties: {
    customId: {
      label: "Custom ID",
      type: "string",
      defaultValue: "",
    },
    availability: {
      label: "Availability",
      type: "enum",
      defaultValue: "available",
      values: {
        available: "Available",
        unavailable: "Unavailable",
      },
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
    const availability = element.properties.get("availability") || "available";
    const elementId = customId || `bookable-unit-${element.id}`;
    const radius = 10;

    const circleStyle = {
      fill: "#e8f4f8",
      stroke: element.selected ? "#0096fd" : "#7ba7c7",
      strokeWidth: element.selected ? "3px" : "2px",
    };

    const innerCircleStyle = {
      fill: availability === "available" ? "#22c55e" : "#ef4444", // green or red
      stroke: "none",
    };

    return (
      <g>
        {/* Outer circle */}
        <circle
          cx="0"
          cy="0"
          r={radius}
          id={elementId}
          data-custom-id={customId}
          data-element-type="item"
          data-element-id={element.id}
          data-availability={availability}
          style={circleStyle}
        />

        {/* Inner availability indicator circle */}
        <circle cx="0" cy="0" r={radius * 0.8} style={innerCircleStyle} />
      </g>
    );
  },

  render3D: function (element, layer, scene) {
    const Three = require("three");
    const availability = element.properties.get("availability") || "available";

    // Create outer cylinder
    const outerGeometry = new Three.CylinderGeometry(0.1, 0.1, 0.05, 32);
    const outerMaterial = new Three.MeshLambertMaterial({
      color: "#e8f4f8",
      transparent: true,
      opacity: 0.8,
    });

    const outerMesh = new Three.Mesh(outerGeometry, outerMaterial);
    outerMesh.position.y = 0.025;

    // Create inner cylinder for availability indicator
    const innerGeometry = new Three.CylinderGeometry(0.08, 0.08, 0.06, 32);
    const innerMaterial = new Three.MeshLambertMaterial({
      color: availability === "available" ? "#22c55e" : "#ef4444",
    });

    const innerMesh = new Three.Mesh(innerGeometry, innerMaterial);
    innerMesh.position.y = 0.03;

    // Group both meshes
    const group = new Three.Group();
    group.add(outerMesh);
    group.add(innerMesh);

    if (element.selected) {
      const bbox = new Three.BoxHelper(group, 0x99c3fb);
      bbox.material.linewidth = 5;
      bbox.renderOrder = 1000;
      bbox.material.depthTest = false;
      group.add(bbox);
    }

    return Promise.resolve(group);
  },
};
