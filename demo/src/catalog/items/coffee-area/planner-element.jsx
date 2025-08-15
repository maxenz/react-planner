import React from "react";

export default {
  name: "coffee-area",
  prototype: "items",

  info: {
    tag: ["coffee", "cafe", "kitchen", "break"],
    title: "Coffee Area",
    description: "Coffee/Cafe area with circular icon",
    image: require("./coffee-icon.png"),
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
    const elementId = customId || `coffee-${element.id}`;
    const radius = 30;

    const circleStyle = {
      fill: "#8db4d3",
      stroke: element.selected ? "#0096fd" : "#6b9dc4",
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

        {/* Coffee icon using provided SVG path */}
        <g transform="scale(0.8, -0.8) translate(-375, -375)">
          <path
            d="M374.7,358.984c-9.3,0-16.9,7.6-16.9,16.9s7.6,16.9,16.9,16.9,16.9-7.6,16.9-16.9-7.6-16.9-16.9-16.9ZM377.604,364.502l-.042-.043c-.222-.223-.222-.586,0-.809.222-.224.581-.224.802,0l.042.043c1.345,1.357,1.345,3.565,0,4.922-.438.441-.678,1.028-.678,1.652s.241,1.211.678,1.652c.222.224.222.586,0,.809-.111.112-.256.168-.401.168s-.29-.056-.401-.167c-.652-.657-1.011-1.531-1.011-2.461,0-.93.359-1.804,1.011-2.461.903-.911.903-2.393,0-3.304ZM374.321,364.502l-.042-.043c-.222-.223-.222-.586,0-.809.222-.224.581-.224.802,0l.042.043c.652.657,1.011,1.531,1.011,2.461s-.359,1.804-1.011,2.461c-.438.441-.678,1.028-.678,1.652s.241,1.211.678,1.652c.222.223.222.586,0,.809-.111.112-.256.168-.401.168s-.29-.056-.401-.168c-.652-.657-1.011-1.531-1.011-2.461s.359-1.804,1.011-2.461c.438-.441.678-1.028.678-1.652s-.241-1.211-.678-1.652ZM371.037,364.502l-.042-.043c-.222-.223-.222-.586,0-.809.222-.224.581-.224.802,0l.042.043c1.345,1.357,1.345,3.565,0,4.922-.438.441-.678,1.028-.678,1.652s.241,1.211.678,1.652c.222.223.222.586,0,.809-.111.112-.256.168-.401.168s-.29-.056-.401-.168c-.652-.657-1.011-1.531-1.011-2.461,0-.93.359-1.804,1.011-2.461.903-.911.903-2.393,0-3.304ZM386.3,385.679h-23.201c-.313,0-.567-.256-.567-.572s.254-.572.567-.572h6.73c-1.982-1.286-3.3-3.528-3.3-6.077v-3.878c0-.316.254-.572.567-.572h15.204c.313,0,.567.256.567.572v1.43h1.105c1.548,0,2.808,1.271,2.808,2.832s-1.26,2.832-2.808,2.832h-1.857c-.579,1.169-1.464,2.158-2.547,2.861h6.73c.313,0,.567.256.567.572s-.254.572-.567.572Z"
            fill="white"
            stroke="none"
          />
        </g>
      </g>
    );
  },

  render3D: function (element, layer, scene) {
    const Three = require("three");

    // Create a cylinder for the coffee area
    const geometry = new Three.CylinderGeometry(0.3, 0.3, 0.05, 32);
    const material = new Three.MeshLambertMaterial({
      color: "#8db4d3",
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
