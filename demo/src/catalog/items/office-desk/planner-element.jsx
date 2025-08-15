import * as Three from 'three';
import React from 'react';

const DEFAULT_WIDTH = 80;
const DEFAULT_DEPTH = 80;
const HEIGHT = 90;

const brown = new Three.MeshLambertMaterial( {color: 0x9b8c75} );
const grey  = new Three.MeshLambertMaterial( {color: 0xd9d7d7} );
const darkBrown = new Three.MeshBasicMaterial({color:0x8B4513});

const objectMaxLOD = makeObjectMaxLOD();
const objectMinLOD = makeObjectMinLOD();

function makeObjectMaxLOD() {

  let desk = new Three.Mesh();

  let newDepth = .8;
  let newWidth = .8;
  let newHeight = 1;
  let radius = .03;

  // Create circular desktop
  let geometry = new Three.CylinderGeometry( newWidth/2, newWidth/2, newHeight/20, 32 );
  let plane = new Three.Mesh( geometry, darkBrown);
  plane.position.y = newHeight;
  desk.add(plane);

  let geometry_legs = new Three.CylinderGeometry( radius, radius, newHeight, 32, 32 );

  // Central support
  let centralSupport = new Three.Mesh( geometry_legs, grey );
  centralSupport.position.x = 0;
  centralSupport.position.z = 0;
  centralSupport.position.y = newHeight/2;
  desk.add(centralSupport);

  return desk
}

function makeObjectMinLOD() {

  let desk = new Three.Mesh();

  let newDepth = .8;
  let newWidth = .8;
  let newHeight = 1;
  let radius = .03;

  // Create circular desktop
  let geometry = new Three.CylinderGeometry( newWidth/2, newWidth/2, newHeight/20, 16 );
  let plane = new Three.Mesh( geometry, darkBrown);
  plane.position.y = newHeight;
  desk.add(plane);

  let geometry_legs = new Three.CylinderGeometry( radius, radius, newHeight, 16, 16 );

  // Central support
  let centralSupport = new Three.Mesh( geometry_legs, grey );
  centralSupport.position.x = 0;
  centralSupport.position.z = 0;
  centralSupport.position.y = newHeight/2;
  desk.add(centralSupport);

  return desk
}

export default {
  name: 'office desk',
  prototype: 'items',

  info: {
    tag: ['furnishings', 'office'],
    title: 'Office Desk',
    description: 'Circular office desk for individual workstation',
    image: require('./office-desk.png')
  },

  properties: {
    width: {
      label: 'width',
      type: 'length-measure',
      defaultValue: {
        length: 80,
        unit: 'cm'
      }
    },
    height: {
      label: 'height',
      type: 'length-measure',
      defaultValue: {
        length: 80,
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
    const elementId = customId || `office-desk-${element.id}`;
    
    const deskWidth = element.properties.get('width') ? element.properties.get('width').get('length') : 80;
    const deskHeight = element.properties.get('height') ? element.properties.get('height').get('length') : 80;
    const radius = Math.min(deskWidth, deskHeight) / 2;

    return (
      <g transform={`translate(${-radius},${-radius})`}>
        <circle key='1' cx={radius} cy={radius} r={radius}
              id={elementId}
              data-custom-id={customId}
              data-element-type="item"
              data-element-id={element.id}
              style={{stroke: element.selected ? '#0096fd' : '#2c3e50', strokeWidth: '2px', fill: '#8B4513', opacity: 0.8}}/>
        <circle key='2' cx={radius} cy={radius} r={radius * 0.7}
              style={{stroke: '#654321', strokeWidth: '1px', fill: 'none', opacity: 0.6}}/>
        <text key='3' x='0' y='0'
              transform={`translate(${radius}, ${radius}) scale(1,-1) rotate(${textRotation})`}
              style={{textAnchor: 'middle', fontSize: '10px', fill: '#fff', fontWeight: 'bold'}}>
          DESK
        </text>
      </g>
    )
  },

  render3D: function (element, layer, scene) {

    let newAltitude = element.properties.get('altitude').get('length');

    /************* lod max ******************/

    let deskMaxLOD = new Three.Object3D();
    deskMaxLOD.add(objectMaxLOD.clone());

    let valueObject = new Three.Box3().setFromObject(deskMaxLOD);

    let deltaX = Math.abs(valueObject.max.x - valueObject.min.x);
    let deltaY = Math.abs(valueObject.max.y - valueObject.min.y);
    let deltaZ = Math.abs(valueObject.max.z - valueObject.min.z);

    deskMaxLOD.rotation.y+=Math.PI;
    deskMaxLOD.position.y+= newAltitude;
    const deskWidth = element.properties.get('width') ? element.properties.get('width').get('length') : 80;
    const deskHeight = element.properties.get('height') ? element.properties.get('height').get('length') : 80;
    deskMaxLOD.scale.set(deskWidth / deltaX, HEIGHT / deltaY, deskHeight / deltaZ );

    /************* lod min ******************/

    let deskMinLOD = new Three.Object3D();
    deskMinLOD.add(objectMinLOD.clone());
    deskMinLOD.rotation.y+=Math.PI;
    deskMinLOD.position.y+= newAltitude;
    const deskWidth2 = element.properties.get('width') ? element.properties.get('width').get('length') : 80;
    const deskHeight2 = element.properties.get('height') ? element.properties.get('height').get('length') : 80;
    deskMinLOD.scale.set(deskWidth2 / deltaX, HEIGHT / deltaY, deskHeight2 / deltaZ );


    /**** all level of detail ***/

    let lod = new Three.LOD();

    lod.addLevel(deskMaxLOD, 200);
    lod.addLevel(deskMinLOD, 900);
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