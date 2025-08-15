import {ElementsFactories} from 'react-planner';

let info = {
  title: 'Office Area',
  tag: ['office', 'area', 'room'],
  description: 'Office area with custom labeling - draw by clicking points to create any shape',
  image: ''
};

let textures = {
  office_light: {
    name: 'Light Office',
    uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    lengthRepeatScale: 1,
    heightRepeatScale: 1,
  },
  office_blue: {
    name: 'Blue Office',
    uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jGL9sAAAAABJRU5ErkJggg==',
    lengthRepeatScale: 1,
    heightRepeatScale: 1,
  },
  office_green: {
    name: 'Green Office',
    uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    lengthRepeatScale: 1,
    heightRepeatScale: 1,
  },
  office_yellow: {
    name: 'Yellow Office',
    uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    lengthRepeatScale: 1,
    heightRepeatScale: 1,
  }
};

// Create the area factory with custom properties
let AreaFactory = ElementsFactories.AreaFactory('office-area', info, textures);

// Override the default properties to add our custom ones
const originalElement = AreaFactory.default || AreaFactory;

export default {
  ...originalElement,
  
  properties: {
    ...originalElement.properties,
    officeLabel: {
      label: 'Office Label',
      type: 'string',
      defaultValue: 'OFFICE'
    },
    customId: {
      label: 'Custom ID',
      type: 'string',
      defaultValue: ''
    }
  },

  render2D: function (element, layer, scene) {
    // Call the original render2D first
    const originalRender = originalElement.render2D(element, layer, scene);
    
    // Calculate the center point of the area for text placement
    if (!element.vertices || element.vertices.size === 0) {
      return originalRender;
    }

    // Calculate centroid of the polygon
    let centerX = 0, centerY = 0;
    element.vertices.forEach(vertexId => {
      const vertex = layer.vertices.get(vertexId);
      if (vertex) {
        centerX += vertex.x;
        centerY += vertex.y;
      }
    });
    centerX /= element.vertices.size;
    centerY /= element.vertices.size;

    const officeLabel = element.properties.get('officeLabel') || 'OFFICE';
    const customId = element.properties.get('customId') || '';
    const elementId = customId || `office-area-${element.id}`;

    // Add text label to the rendered area
    return (
      <g>
        {originalRender}
        <text 
          x={centerX} 
          y={centerY}
          transform={`translate(0, 0) scale(1, -1)`}
          style={{
            textAnchor: 'middle', 
            fontSize: '16px',
            fontWeight: 'bold',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fill: '#2c3e50',
            letterSpacing: '0.5px',
            pointerEvents: 'none'
          }}
          id={`${elementId}-label`}
          data-custom-id={customId}
          data-element-type="area"
          data-element-id={element.id}
        >
          {officeLabel}
        </text>
      </g>
    );
  }
};