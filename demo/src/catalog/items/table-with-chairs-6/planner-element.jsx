import * as Three from 'three';
import React from 'react';

const DEFAULT_TABLE_WIDTH = 150;
const DEFAULT_TABLE_DEPTH = 100;
const CHAIR_SIZE = 25;
const HEIGHT = 80;

const tableMaterial = new Three.MeshLambertMaterial( {color: 0x9b8c75} );
const chairMaterial = new Three.MeshLambertMaterial( {color: 0x666666} );
const legMaterial = new Three.MeshLambertMaterial( {color: 0xd9d7d7} );

function makeObjectMaxLOD() {
  let furniture = new Three.Mesh();

  // Rectangular table
  let tableGeometry = new Three.BoxGeometry( 1.5, 0.05, 1 );
  let table = new Three.Mesh( tableGeometry, tableMaterial );
  table.position.y = 0.8;
  furniture.add(table);

  // Table legs
  let legGeometry = new Three.CylinderGeometry( 0.03, 0.03, 0.8, 8 );
  
  let leg1 = new Three.Mesh( legGeometry, legMaterial );
  leg1.position.set( 0.6, 0.4, 0.4 );
  furniture.add(leg1);
  
  let leg2 = new Three.Mesh( legGeometry, legMaterial );
  leg2.position.set( -0.6, 0.4, 0.4 );
  furniture.add(leg2);
  
  let leg3 = new Three.Mesh( legGeometry, legMaterial );
  leg3.position.set( 0.6, 0.4, -0.4 );
  furniture.add(leg3);
  
  let leg4 = new Three.Mesh( legGeometry, legMaterial );
  leg4.position.set( -0.6, 0.4, -0.4 );
  furniture.add(leg4);

  // 6 Chairs
  let chairGeometry = new Three.BoxGeometry( 0.25, 0.05, 0.25 );
  let chairBackGeometry = new Three.BoxGeometry( 0.25, 0.4, 0.05 );
  
  // Chair positions around rectangular table (2 on short sides, 2 on each long side)
  let chairPositions = [
    { x: 0, z: 0.75 },       // top center
    { x: 0, z: -0.75 },      // bottom center  
    { x: 0.9, z: 0.3 },      // right side 1
    { x: 0.9, z: -0.3 },     // right side 2
    { x: -0.9, z: 0.3 },     // left side 1
    { x: -0.9, z: -0.3 }     // left side 2
  ];

  chairPositions.forEach((pos, i) => {
    // Chair seat
    let chair = new Three.Mesh( chairGeometry, chairMaterial );
    chair.position.set( pos.x, 0.4, pos.z );
    furniture.add(chair);
    
    // Chair back
    let chairBack = new Three.Mesh( chairBackGeometry, chairMaterial );
    let backOffset = 0;
    let sideOffset = 0;
    
    if (i < 2) { // Top/bottom chairs
      backOffset = i === 0 ? 0.1 : -0.1;
    } else { // Side chairs
      sideOffset = i < 4 ? 0.1 : -0.1;
    }
    
    chairBack.position.set( pos.x + sideOffset, 0.6, pos.z + backOffset );
    furniture.add(chairBack);
  });

  return furniture;
}

function makeObjectMinLOD() {
  let furniture = new Three.Mesh();

  // Simplified rectangular table
  let tableGeometry = new Three.BoxGeometry( 1.5, 0.05, 1 );
  let table = new Three.Mesh( tableGeometry, tableMaterial );
  table.position.y = 0.8;
  furniture.add(table);

  // Simplified chairs
  let chairGeometry = new Three.BoxGeometry( 0.25, 0.2, 0.25 );
  let chairPositions = [
    { x: 0, z: 0.75 },
    { x: 0, z: -0.75 },
    { x: 0.9, z: 0.3 },
    { x: 0.9, z: -0.3 },
    { x: -0.9, z: 0.3 },
    { x: -0.9, z: -0.3 }
  ];

  chairPositions.forEach((pos) => {
    let chair = new Three.Mesh( chairGeometry, chairMaterial );
    chair.position.set( pos.x, 0.5, pos.z );
    furniture.add(chair);
  });

  return furniture;
}

const objectMaxLOD = makeObjectMaxLOD();
const objectMinLOD = makeObjectMinLOD();

export default {
  name: 'table with chairs (6 person)',
  prototype: 'items',

  info: {
    tag: ['furnishings', 'meeting'],
    title: 'Table with Chairs (6 person)',
    description: '6-person conference table with chairs',
    image: require('./table-6.png')
  },

  properties: {
    width: {
      label: 'width',
      type: 'length-measure',
      defaultValue: {
        length: 150,
        unit: 'cm'
      }
    },
    height: {
      label: 'height',
      type: 'length-measure',
      defaultValue: {
        length: 100,
        unit: 'cm'
      }
    },
    altitude: {
      label: 'altitude',
      type: 'length-measure',
      defaultValue: {
        length: 0,
        unit: 'cm'
      }
    },
    customId: {
      label: 'Custom ID',
      type: 'string',
      defaultValue: ''
    }
  },

  render2D: function (element, layer, scene) {

    let angle = element.rotation + 90;

    let textRotation = 0;
    if (Math.sin(angle * Math.PI / 180) < 0) {
      textRotation = 180;
    }

    const customId = element.properties.get('customId') || '';
    const elementId = customId || `table-6-${element.id}`;
    
    const tableWidth = element.properties.get('width') ? element.properties.get('width').get('length') : 150;
    const tableHeight = element.properties.get('height') ? element.properties.get('height').get('length') : 100;
    const halfWidth = tableWidth / 2;
    const halfHeight = tableHeight / 2;
    const chairOffset = 8;

    return (
      <g transform={`translate(${-halfWidth},${-halfHeight})`}>
        {/* Table */}
        <rect key='table' x='0' y='0' width={tableWidth} height={tableHeight}
              id={elementId}
              data-custom-id={customId}
              data-element-type="item"
              data-element-id={element.id}
              style={{stroke: element.selected ? '#0096fd' : '#2c3e50', strokeWidth: '2px', fill: '#9b8c75', opacity: 0.9}}/>
        
        {/* Table surface details */}
        <rect key='table-inset' x='5' y='5' width={tableWidth-10} height={tableHeight-10}
              style={{stroke: '#8a7968', strokeWidth: '1px', fill: 'none', opacity: 0.7}}/>

        {/* 6 Chairs around rectangular table */}
        
        {/* Top chair (center) */}
        <rect key='chair-top' 
              x={halfWidth - CHAIR_SIZE/2} y={-CHAIR_SIZE - chairOffset} 
              width={CHAIR_SIZE} height={CHAIR_SIZE}
              style={{stroke: '#333', strokeWidth: '1px', fill: '#666', opacity: 0.8}}/>
        <rect key='chair-top-back' 
              x={halfWidth - CHAIR_SIZE/2 + 3} y={-CHAIR_SIZE - chairOffset - 8} 
              width={CHAIR_SIZE - 6} height={6}
              style={{stroke: 'none', fill: '#555', opacity: 0.8}}/>

        {/* Bottom chair (center) */}
        <rect key='chair-bottom' 
              x={halfWidth - CHAIR_SIZE/2} y={tableHeight + chairOffset} 
              width={CHAIR_SIZE} height={CHAIR_SIZE}
              style={{stroke: '#333', strokeWidth: '1px', fill: '#666', opacity: 0.8}}/>
        <rect key='chair-bottom-back' 
              x={halfWidth - CHAIR_SIZE/2 + 3} y={tableHeight + chairOffset + CHAIR_SIZE} 
              width={CHAIR_SIZE - 6} height={6}
              style={{stroke: 'none', fill: '#555', opacity: 0.8}}/>

        {/* Left side chairs */}
        <rect key='chair-left1' 
              x={-CHAIR_SIZE - chairOffset} y={halfHeight - CHAIR_SIZE - 10} 
              width={CHAIR_SIZE} height={CHAIR_SIZE}
              style={{stroke: '#333', strokeWidth: '1px', fill: '#666', opacity: 0.8}}/>
        <rect key='chair-left1-back' 
              x={-CHAIR_SIZE - chairOffset - 8} y={halfHeight - CHAIR_SIZE - 10 + 3} 
              width={6} height={CHAIR_SIZE - 6}
              style={{stroke: 'none', fill: '#555', opacity: 0.8}}/>

        <rect key='chair-left2' 
              x={-CHAIR_SIZE - chairOffset} y={halfHeight + 10} 
              width={CHAIR_SIZE} height={CHAIR_SIZE}
              style={{stroke: '#333', strokeWidth: '1px', fill: '#666', opacity: 0.8}}/>
        <rect key='chair-left2-back' 
              x={-CHAIR_SIZE - chairOffset - 8} y={halfHeight + 10 + 3} 
              width={6} height={CHAIR_SIZE - 6}
              style={{stroke: 'none', fill: '#555', opacity: 0.8}}/>

        {/* Right side chairs */}
        <rect key='chair-right1' 
              x={tableWidth + chairOffset} y={halfHeight - CHAIR_SIZE - 10} 
              width={CHAIR_SIZE} height={CHAIR_SIZE}
              style={{stroke: '#333', strokeWidth: '1px', fill: '#666', opacity: 0.8}}/>
        <rect key='chair-right1-back' 
              x={tableWidth + chairOffset + CHAIR_SIZE} y={halfHeight - CHAIR_SIZE - 10 + 3} 
              width={6} height={CHAIR_SIZE - 6}
              style={{stroke: 'none', fill: '#555', opacity: 0.8}}/>

        <rect key='chair-right2' 
              x={tableWidth + chairOffset} y={halfHeight + 10} 
              width={CHAIR_SIZE} height={CHAIR_SIZE}
              style={{stroke: '#333', strokeWidth: '1px', fill: '#666', opacity: 0.8}}/>
        <rect key='chair-right2-back' 
              x={tableWidth + chairOffset + CHAIR_SIZE} y={halfHeight + 10 + 3} 
              width={6} height={CHAIR_SIZE - 6}
              style={{stroke: 'none', fill: '#555', opacity: 0.8}}/>

        <text key='text' x='0' y='0'
              transform={`translate(${halfWidth}, ${halfHeight}) scale(1,-1) rotate(${textRotation})`}
              style={{textAnchor: 'middle', fontSize: '9px', fill: '#fff', fontWeight: 'bold'}}>
          TABLE
        </text>
      </g>
    )
  },

  render3D: function (element, layer, scene) {

    let newAltitude = element.properties.get('altitude').get('length');

    /************* lod max ******************/

    let furnitureMaxLOD = new Three.Object3D();
    furnitureMaxLOD.add(objectMaxLOD.clone());

    let valueObject = new Three.Box3().setFromObject(furnitureMaxLOD);

    let deltaX = Math.abs(valueObject.max.x - valueObject.min.x);
    let deltaY = Math.abs(valueObject.max.y - valueObject.min.y);
    let deltaZ = Math.abs(valueObject.max.z - valueObject.min.z);

    furnitureMaxLOD.position.y += newAltitude;
    const tableWidth = element.properties.get('width') ? element.properties.get('width').get('length') : 150;
    const tableHeight = element.properties.get('height') ? element.properties.get('height').get('length') : 100;
    furnitureMaxLOD.scale.set((tableWidth + 60) / deltaX, HEIGHT / deltaY, (tableHeight + 60) / deltaZ);

    /************* lod min ******************/

    let furnitureMinLOD = new Three.Object3D();
    furnitureMinLOD.add(objectMinLOD.clone());
    furnitureMinLOD.position.y += newAltitude;
    const tableWidth2 = element.properties.get('width') ? element.properties.get('width').get('length') : 150;
    const tableHeight2 = element.properties.get('height') ? element.properties.get('height').get('length') : 100;
    furnitureMinLOD.scale.set((tableWidth2 + 60) / deltaX, HEIGHT / deltaY, (tableHeight2 + 60) / deltaZ);

    /**** all level of detail ***/

    let lod = new Three.LOD();

    lod.addLevel(furnitureMaxLOD, 200);
    lod.addLevel(furnitureMinLOD, 900);
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
  }

};