import {Catalog} from 'react-planner';

let catalog = new Catalog();

import * as Areas from './areas/**/planner-element.jsx';
import * as Lines from './lines/**/planner-element.jsx';
import * as Holes from './holes/**/planner-element.jsx';
import * as Items from './items/**/planner-element.jsx';

// Explicitly import internal separator
import InternalSeparator from './lines/internal-separator/planner-element.jsx';

// Explicitly import functional area items
import CoffeeArea from './items/coffee-area/planner-element.jsx';
import BathroomArea from './items/bathroom-area/planner-element.jsx';
import Label from './items/label/planner-element.jsx';

for( let x in Areas ) catalog.registerElement( Areas[x] );
for( let x in Lines ) catalog.registerElement( Lines[x] );
for( let x in Holes ) catalog.registerElement( Holes[x] );
for( let x in Items ) catalog.registerElement( Items[x] );

// Register internal separator explicitly
catalog.registerElement( InternalSeparator );

// Register functional area items explicitly
catalog.registerElement( CoffeeArea );
catalog.registerElement( BathroomArea );
catalog.registerElement( Label );

catalog.registerCategory('windows', 'Windows', [Holes.window, Holes.sashWindow, Holes.venetianBlindWindow, Holes.windowCurtain] );
catalog.registerCategory('doors', 'Doors', [Holes.door, Holes.doorDouble, Holes.panicDoor, Holes.panicDoorDouble, Holes.slidingDoor] );

export default catalog;
