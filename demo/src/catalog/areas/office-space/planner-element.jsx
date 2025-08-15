import React from 'react';

export default {
  name: 'office-space',
  prototype: 'items',

  info: {
    tag: ['office', 'space', 'room'],
    title: 'Office Space',
    description: 'Resizable office space area',
    image: require('./office-space.png')
  },

  properties: {
    width: {
      label: 'Width',
      type: 'length-measure',
      defaultValue: {
        length: 200,
        unit: 'cm'
      }
    },
    height: {
      label: 'Height', 
      type: 'length-measure',
      defaultValue: {
        length: 150,
        unit: 'cm'
      }
    },
    color: {
      label: 'Color',
      type: 'color',
      defaultValue: '#e8f4f8'
    },
    label: {
      label: 'Office Label',
      type: 'string',
      defaultValue: 'OFFICE'
    },
    customId: {
      label: 'Custom ID',
      type: 'string',
      defaultValue: ''
    },
    altitude: {
      label: 'Altitude',
      type: 'length-measure',
      defaultValue: {
        length: 0,
        unit: 'cm'
      }
    }
  },

  render2D: function (element, layer, scene) {
    const width = element.properties.get('width').get('length');
    const height = element.properties.get('height').get('length');
    const color = element.properties.get('color');
    const label = element.properties.get('label');
    const customId = element.properties.get('customId') || '';
    const elementId = customId || `office-${element.id}`;

    let angle = element.rotation + 90;
    let textRotation = 0;
    if (Math.sin(angle * Math.PI / 180) < 0) {
      textRotation = 180;
    }

    const rectStyle = {
      stroke: element.selected ? '#0096fd' : '#333', 
      strokeWidth: '2px', 
      fill: color,
      fillOpacity: 0.3
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
        {/* Dashed border for office outline */}
        <rect 
          x="0" 
          y="0" 
          width={width} 
          height={height}
          fill="none"
          stroke="#666"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        {/* Office label */}
        <text 
          x={width / 2} 
          y={height / 2}
          transform={`translate(0, 0) scale(1, -1) rotate(${textRotation})`}
          style={{
            textAnchor: 'middle', 
            fontSize: '16px',
            fontWeight: 'bold',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fill: '#2c3e50',
            letterSpacing: '0.5px'
          }}
        >
          {label}
        </text>
        {/* Dimensions text */}
        <text 
          x={width / 2} 
          y={height / 2 + 20}
          transform={`translate(0, 0) scale(1, -1) rotate(${textRotation})`}
          style={{
            textAnchor: 'middle', 
            fontSize: '11px',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fill: '#7f8c8d',
            fontWeight: '500'
          }}
        >
          {width}×{height}cm
        </text>
      </g>
    );
  },

  render3D: function (element, layer, scene) {
    // For 3D, create a simple box representing the office space
    const width = element.properties.get('width').get('length');
    const height = element.properties.get('height').get('length');
    const altitude = element.properties.get('altitude').get('length');
    const color = element.properties.get('color');

    const Three = require('three');
    
    // Create a simple box geometry for the office space
    const geometry = new Three.BoxGeometry(width / 100, 0.1, height / 100); // Convert cm to meters
    const material = new Three.MeshLambertMaterial({ 
      color: color,
      transparent: true,
      opacity: 0.3 
    });
    
    const mesh = new Three.Mesh(geometry, material);
    mesh.position.y = altitude / 100;
    
    if (element.selected) {
      const bbox = new Three.BoxHelper(mesh, 0x99c3fb);
      bbox.material.linewidth = 5;
      bbox.renderOrder = 1000;
      bbox.material.depthTest = false;
      mesh.add(bbox);
    }

    return Promise.resolve(mesh);
  }
};