import React from "react";

export default {
  name: "bathroom-area",
  prototype: "items",

  info: {
    tag: ["bathroom", "restroom", "toilet", "wc"],
    title: "Bathroom",
    description: "Bathroom/Restroom area with circular icon",
    image: require("./bathroom-icon.png"),
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
    const elementId = customId || `bathroom-${element.id}`;
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

        {/* Bathroom icon using provided SVG path */}
        <g transform="scale(0.8, -0.8) translate(-1030, -410)">
          <path
            d="M1030.117,394.786c9.267,0,16.778,7.511,16.778,16.778s-7.511,16.778-16.778,16.778-16.778-7.511-16.778-16.778,7.511-16.778,16.778-16.778h0ZM1022.318,423.852c.158.094.18.201.338.309.122.086.288.158.489.18.396.043.971.014,1.389.007h7.835l2.662-.007c.468-.058.619-.302.842-.568.173-.612.101-.64-.029-1.245-.086-.396-.209-.863-.266-1.252l-.784-3.626c.388-.043,3.763-.014,4.468-.014,1.014,0,2.813.266,2.806-1.727-.022-3.014-.014-6.029-.014-9.036-1.108.187-2.461.101-3.633.101h-3.763c-.043.489-.014,2.626-.014,3.281,0,1.036.043,2.166-.101,3.173-.331,2.324-1.475,4.144-3.065,5.54-.072.065-.129.108-.23.187-.151.122-.309.23-.482.36-1.856,1.345-4.302,1.777-6.612,1.554-.525-.05-.942-.173-1.432-.245-.173.317-.252,1.086-.345,1.489-.058.252-.115.489-.158.734-.086.446.058.496.101.806h0ZM1032.398,411.535h-15.281c-.144,2.338.669,4.482,2.216,6.123.288.302.741.676,1.13.935,1.568,1.058,2.842,1.446,4.871,1.446,1.309,0,2.417-.173,3.504-.669,3-1.374,4.95-4.381,4.712-7.835h-1.151ZM1037.7,399.175c-.324.266-.36.245-.525.748-.05,1.115.446.237.324,1.935l-2.964.007c-.475.079-.547.367-.547.871l.007,2.619c.137.705.777.547,1.504.547h6.209c.827-.007.719-.626.719-1.338,0-3.295.511-2.655-3.259-2.698-.029,0-.094,0-.122-.007l-.101-.029c-.007,0-.022-.007-.029-.014-.007-.799-.086-.82.108-1.079.101-.129.187-.317.209-.496.036-.281-.029-.568-.173-.755-.288-.381-.791-.532-1.36-.309h0ZM1029.808,410.557h2.374c.022-.863.144-1.691-.345-2.194-.209-.216-.216-.18-.475-.338l-.324-.101c-.324.079-1.827.029-2.273.029h-2.281c-1.532-.007-3.101-.022-4.633.007-.741.007-2.259-.137-2.784.201-.259.165-.525.518-.568.942s-.007.993-.007,1.453h11.317Z"
            fill="white"
            stroke="none"
          />
        </g>
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
