import * as Three from "three";
import React from "react";

const RADIUS = 3;

const PlaneMaterial = new Three.MeshLambertMaterial({ color: 0x9b8c75 });
const material_legs = new Three.MeshLambertMaterial({ color: 0xd9d7d7 });

function makeObjectMaxLOD(newWidth, newHeight, newDepth) {
  let table = new Three.Mesh();

  let PlaneGeometry = new Three.BoxGeometry(newWidth, newHeight / 20, newDepth);
  let plane = new Three.Mesh(PlaneGeometry, PlaneMaterial);
  plane.position.y = newHeight;
  table.add(plane);

  let geometry_legs = new Three.CylinderGeometry(
    RADIUS,
    RADIUS,
    newHeight,
    32,
    32
  );

  let leg1 = new Three.Mesh(geometry_legs, material_legs);
  leg1.position.x = newWidth / 2;
  leg1.position.z = newDepth / 2;
  leg1.position.y = newHeight / 2;
  table.add(leg1);

  let leg2 = new Three.Mesh(geometry_legs, material_legs);
  leg2.position.x = newWidth / 2;
  leg2.position.z = -newDepth / 2;
  leg2.position.y = newHeight / 2;
  table.add(leg2);

  let leg3 = new Three.Mesh(geometry_legs, material_legs);
  leg3.position.x = -newWidth / 2;
  leg3.position.z = newDepth / 2;
  leg3.position.y = newHeight / 2;
  table.add(leg3);

  let leg4 = new Three.Mesh(geometry_legs, material_legs);
  leg4.position.x = -newWidth / 2;
  leg4.position.z = -newDepth / 2;
  leg4.position.y = newHeight / 2;
  table.add(leg4);

  return table;
}

function makeObjectMinLOD(newWidth, newHeight, newDepth) {
  let table = new Three.Mesh();

  let PlaneGeometry = new Three.BoxGeometry(newWidth, newHeight / 20, newDepth);
  let plane = new Three.Mesh(PlaneGeometry, PlaneMaterial);
  plane.position.y = newHeight;
  table.add(plane);

  let geometry_legs = new Three.CylinderGeometry(
    RADIUS,
    RADIUS,
    newHeight,
    8,
    8
  );

  let leg1 = new Three.Mesh(geometry_legs, material_legs);
  leg1.position.x = newWidth / 2;
  leg1.position.z = newDepth / 2;
  leg1.position.y = newHeight / 2;
  table.add(leg1);

  let leg2 = new Three.Mesh(geometry_legs, material_legs);
  leg2.position.x = newWidth / 2;
  leg2.position.z = -newDepth / 2;
  leg2.position.y = newHeight / 2;
  table.add(leg2);

  let leg3 = new Three.Mesh(geometry_legs, material_legs);
  leg3.position.x = -newWidth / 2;
  leg3.position.z = newDepth / 2;
  leg3.position.y = newHeight / 2;
  table.add(leg3);

  let leg4 = new Three.Mesh(geometry_legs, material_legs);
  leg4.position.x = -newWidth / 2;
  leg4.position.z = -newDepth / 2;
  leg4.position.y = newHeight / 2;
  table.add(leg4);

  return table;
}

export default {
  name: "table",
  prototype: "items",

  info: {
    tag: ["furnishings", "wood"],
    title: "table",
    description: "table",
    image: require("./table.png"),
  },

  properties: {
    shape: {
      label: "Shape",
      type: "enum",
      defaultValue: "rectangular",
      values: {
        rectangular: "Rectangular",
        circular: "Circular",
      },
    },
    width: {
      label: "width",
      type: "length-measure",
      defaultValue: {
        length: 90,
        unit: "cm",
      },
    },
    depth: {
      label: "depth",
      type: "length-measure",
      defaultValue: {
        length: 50,
        unit: "cm",
      },
    },
    diameter: {
      label: "diameter",
      type: "length-measure",
      defaultValue: {
        length: 80,
        unit: "cm",
      },
    },
    height: {
      label: "height",
      type: "length-measure",
      defaultValue: {
        length: 80,
        unit: "cm",
      },
    },
    altitude: {
      label: "altitude",
      type: "length-measure",
      defaultValue: {
        length: 0,
        unit: "cm",
      },
    },
    customId: {
      label: "Custom ID",
      type: "string",
      defaultValue: "",
    },
  },

  render2D: function (element, layer, scene) {
    const shape = element.properties.get("shape") || "rectangular";
    const customId = element.properties.get("customId") || "";
    const elementId = customId || `table-${element.id}`;

    if (shape === "circular") {
      const diameter = element.properties.get("diameter").get("length");
      const radius = diameter / 2;

      return (
        <circle
          cx="0"
          cy="0"
          r={radius}
          id={elementId}
          data-custom-id={customId}
          data-element-type="item"
          data-element-id={element.id}
          data-table-shape="circular"
          style={{
            stroke: element.selected ? "#0096fd" : "#000",
            strokeWidth: "2px",
            fill: "white",
          }}
        />
      );
    } else {
      // Rectangular table
      let newWidth = element.properties.get("width").get("length");
      let newDepth = element.properties.get("depth").get("length");

      return (
        <g transform={`translate(${-newWidth / 2},${-newDepth / 2})`}>
          <rect
            key="1"
            x="0"
            y="0"
            width={newWidth}
            height={newDepth}
            id={elementId}
            data-custom-id={customId}
            data-element-type="item"
            data-element-id={element.id}
            data-table-shape="rectangular"
            style={{
              stroke: element.selected ? "#0096fd" : "#000",
              strokeWidth: "2px",
              fill: "white",
            }}
          />
        </g>
      );
    }
  },

  render3D: function (element, layer, scene) {
    let newWidth = element.properties.get("width").get("length");
    let newDepth = element.properties.get("depth").get("length");
    let newHeight = element.properties.get("height").get("length");
    let newAltitude = element.properties.get("altitude").get("length");

    /********** lod max ************/

    let tableMaxLOD = new Three.Object3D();
    let objectMaxLod = makeObjectMaxLOD(newWidth, newHeight, newDepth);
    tableMaxLOD.add(objectMaxLod.clone());
    tableMaxLOD.position.y += newHeight / 20 + newAltitude;

    /********** lod min ************/

    let tableMinLOD = new Three.Object3D();
    let objectMinLod = makeObjectMinLOD(newWidth, newHeight, newDepth);
    tableMinLOD.add(objectMinLod.clone());
    tableMinLOD.position.y += newHeight / 20 + newAltitude;

    /**** all level of detail ***/

    let lod = new Three.LOD();

    lod.addLevel(tableMaxLOD, 200);
    lod.addLevel(tableMinLOD, 900);
    lod.updateMatrix();
    lod.matrixAutoUpdate = false;

    if (element.selected) {
      let bbox = new Three.BoxHelper(lod, 0x99c3fb);
      bbox.material.linewidth = 5;
      bbox.renderOrder = 1000;
      bbox.material.depthTest = false;
      lod.add(bbox);
    }

    return Promise.resolve(lod);
  },
};
