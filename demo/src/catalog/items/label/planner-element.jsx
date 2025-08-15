import React from 'react';

export default {
  name: 'label',
  prototype: 'items',

  info: {
    tag: ['label', 'text', 'annotation'],
    title: 'Label',
    description: 'Customizable text label that can be placed anywhere',
    image: require('./label.png')
  },

  properties: {
    text: {
      label: 'Text',
      type: 'string',
      defaultValue: 'LABEL'
    },
    fontSize: {
      label: 'Font Size',
      type: 'length-measure',
      defaultValue: {
        length: 16,
        unit: 'px'
      }
    },
    color: {
      label: 'Text Color',
      type: 'color',
      defaultValue: '#2c3e50'
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
    const customId = element.properties.get('customId') || '';
    const elementId = customId || `label-${element.id}`;
    const text = element.properties.get('text') || 'LABEL';
    const fontSize = element.properties.get('fontSize') ? element.properties.get('fontSize').get('length') : 16;
    const color = element.properties.get('color') || '#2c3e50';

    return (
      <g>
        {/* Invisible background for selection */}
        <rect 
          x={-text.length * fontSize/4} 
          y={-fontSize/2} 
          width={text.length * fontSize/2} 
          height={fontSize}
          fill="transparent"
          stroke={element.selected ? '#0096fd' : 'transparent'}
          strokeWidth={element.selected ? '2px' : '0'}
          strokeDasharray={element.selected ? '3,3' : ''}
          id={elementId}
          data-custom-id={customId}
          data-element-type="item"
          data-element-id={element.id}
        />
        
        {/* Text label */}
        <text 
          x="0" 
          y="0"
          transform="scale(1, -1)"
          style={{
            textAnchor: 'middle',
            dominantBaseline: 'middle',
            fontSize: `${fontSize}px`,
            fontWeight: 'bold',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fill: color,
            letterSpacing: '0.5px',
            userSelect: 'none'
          }}
        >
          {text}
        </text>
      </g>
    );
  },

  render3D: function (element, layer, scene) {
    // For 3D, create a simple plane with text (or just return empty mesh)
    const Three = require('three');
    
    // Create a minimal mesh for 3D view
    const geometry = new Three.PlaneGeometry(0.1, 0.1);
    const material = new Three.MeshLambertMaterial({ 
      color: '#ffffff',
      transparent: true,
      opacity: 0 
    });
    
    const mesh = new Three.Mesh(geometry, material);
    
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