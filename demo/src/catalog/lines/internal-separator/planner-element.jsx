import React from 'react';
import { ElementsFactories } from 'react-planner';

// Custom factory for internal separators with dashed lines
function InternalSeparatorFactory(name, info, textures) {
  
  const STYLE_LINE_BASE = { 
    strokeWidth: 2, 
    stroke: '#999999', 
    fill: 'none',
    strokeDasharray: '8,5'
  };
  
  const STYLE_LINE_SELECTED = { 
    ...STYLE_LINE_BASE, 
    stroke: '#0096fd',
    strokeWidth: 3
  };

  let separatorElement = ElementsFactories.WallFactory(name, info, textures);
  
  // Override the render2D function to create dashed lines
  separatorElement.render2D = function (element, layer, scene) {
    let { x: x1, y: y1 } = layer.vertices.get(element.vertices.get(0));
    let { x: x2, y: y2 } = layer.vertices.get(element.vertices.get(1));

    // Calculate line length using basic distance formula since Geometry might not be available
    let length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    return (element.selected) ?
      <line x1="0" y1="0" x2={length} y2="0" style={STYLE_LINE_SELECTED} /> :
      <line x1="0" y1="0" x2={length} y2="0" style={STYLE_LINE_BASE} />;
  };

  return separatorElement;
}

const info = {
  title: 'internal-separator',
  tag: ['internal', 'separator', 'divider'],
  description: 'Internal separator with dashed line style for dividing office spaces',
  image: require('./internal-separator.png'),
  visibility: {
    catalog: true,
    layerElementsVisible: true
  }
};

const textures = {
  separator: {
    name: 'Separator',
    uri: require('./textures/separator.jpg'),
    lengthRepeatScale: 0.01,
    heightRepeatScale: 0.01
  }
};

export default InternalSeparatorFactory('internal-separator', info, textures);