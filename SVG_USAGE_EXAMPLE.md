# SVG Export Usage Example

## How to Set Custom IDs in React Planner

1. **Add furniture**: Click the "+" button to open the catalog, then add a desk or table to your floor plan.

2. **Select the element**: Click on the desk/table you placed to select it (it should show a blue highlight).

3. **View properties**: Look at the right sidebar - you should see element properties including "Custom ID" field.

4. **Set custom ID**: Enter a custom ID like "desk-001" or "table-meeting-room-1" in the Custom ID field.

5. **Export SVG**: Click the SVG export button in the toolbar (document icon with lines).

## Using the Exported SVG in Your React App

```jsx
import React, { useRef, useEffect } from 'react';

function FloorPlanViewer({ svgContent }) {
  const svgRef = useRef();

  useEffect(() => {
    if (svgRef.current) {
      // Add click handlers to all clickable elements
      const clickableElements = svgRef.current.querySelectorAll('[data-element-type]');
      
      clickableElements.forEach(element => {
        element.addEventListener('click', handleElementClick);
        element.style.cursor = 'pointer';
      });

      return () => {
        clickableElements.forEach(element => {
          element.removeEventListener('click', handleElementClick);
        });
      };
    }
  }, [svgContent]);

  const handleElementClick = (event) => {
    const { customId, elementType, elementId } = event.target.dataset;
    
    // Show popup with element information
    const info = {
      customId: customId || 'No custom ID set',
      elementType,
      elementId,
      elementName: event.target.getAttribute('data-item-type') || elementType
    };
    
    // You can show a modal, tooltip, or sidebar here
    console.log('Clicked element:', info);
    showElementPopup(info);
  };

  const showElementPopup = (info) => {
    // Example popup implementation
    alert(`Element: ${info.elementName}\nCustom ID: ${info.customId}\nType: ${info.elementType}`);
  };

  return (
    <div className="floor-plan-container">
      <div 
        ref={svgRef} 
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
}

export default FloorPlanViewer;
```

## SVG Structure Reference

The exported SVG will contain elements with these data attributes:

```xml
<!-- Furniture items (desks, tables, etc.) -->
<rect 
  id="desk-001" 
  data-custom-id="desk-001" 
  data-element-type="item" 
  data-element-id="abc123"
  data-item-type="desk"
/>

<!-- Walls -->
<line 
  id="wall-456" 
  data-custom-id="" 
  data-element-type="line" 
  data-element-id="def456"
/>

<!-- Rooms/Areas -->
<polygon 
  id="room-789" 
  data-custom-id="" 
  data-element-type="area" 
  data-element-id="ghi789"
/>
```

## Troubleshooting

### "I don't see the Custom ID field"
- Make sure you've selected an element (desk or table) by clicking on it
- The selected element should have a blue highlight
- Check the right sidebar for the properties panel

### "The SVG looks wrong"
- The coordinate system has been fixed to match the React Planner view
- Elements should now appear in the correct positions
- If issues persist, try refreshing and re-creating your floor plan

### "No custom ID in exported SVG"
- Custom IDs are optional - if not set, auto-generated IDs are used
- You can always add IDs programmatically in your consuming application
- Check the `data-element-id` attribute for the internal element ID