import {
  MODE_IDLE,
  MODE_3D_FIRST_PERSON,
  MODE_3D_VIEW,
  MODE_SNAPPING,
  KEYBOARD_BUTTON_CODE
} from '../constants';

import { List, Map } from 'immutable';

import {
  rollback,
  undo,
  remove,
  toggleSnap,
  copyProperties,
  pasteProperties,
  copyElements,
  pasteElements,
  setAlterateState
} from '../actions/project-actions';

export default function keyboard() {

  return (store, stateExtractor) => {

    window.addEventListener('keydown', event => {

      let state = stateExtractor(store.getState());
      let mode = state.get('mode');

      switch (event.keyCode) {
        case KEYBOARD_BUTTON_CODE.BACKSPACE:
        case KEYBOARD_BUTTON_CODE.DELETE:
        {
          if ([MODE_IDLE, MODE_3D_FIRST_PERSON, MODE_3D_VIEW].includes(mode))
            store.dispatch(remove());
          break;
        }
        case KEYBOARD_BUTTON_CODE.ESC:
        {
          store.dispatch(rollback());
          break;
        }
        case KEYBOARD_BUTTON_CODE.Z:
        {
          if (event.getModifierState('Control') || event.getModifierState('Meta'))
            store.dispatch(undo());
          break;
        }
        case KEYBOARD_BUTTON_CODE.ALT:
        {
          if (MODE_SNAPPING.includes(mode))
            store.dispatch(toggleSnap(state.snapMask.merge({
              SNAP_POINT: false,
              SNAP_LINE: false,
              SNAP_SEGMENT: false,
              SNAP_GRID : false,
              SNAP_GUIDE : false,
              tempSnapConfiguartion: state.snapMask.toJS()
            })));
          break;
        }
        case KEYBOARD_BUTTON_CODE.C:
        {
          if (event.ctrlKey || event.metaKey) {
            let selectedLayer = state.getIn(['scene', 'selectedLayer']);
            let selected = state.getIn(['scene', 'layers', selectedLayer, 'selected']);

            if ( ( mode === MODE_IDLE || mode === MODE_3D_VIEW ) && (selected.holes.size || selected.areas.size || selected.items.size || selected.lines.size)) {
              // Copy entire elements when Ctrl+C is pressed
              let elementsToClipboard = [];

              // Copy selected items
              if (selected.items.size) {
                selected.items.forEach(itemID => {
                  let item = state.getIn(['scene', 'layers', selectedLayer, 'items', itemID]);
                  elementsToClipboard.push(Map({
                    elementType: 'items',
                    element: item
                  }));
                });
              }

              // Copy selected areas
              if (selected.areas.size) {
                selected.areas.forEach(areaID => {
                  let area = state.getIn(['scene', 'layers', selectedLayer, 'areas', areaID]);
                  elementsToClipboard.push(Map({
                    elementType: 'areas',
                    element: area
                  }));
                });
              }

              // Copy selected lines
              if (selected.lines.size) {
                selected.lines.forEach(lineID => {
                  let line = state.getIn(['scene', 'layers', selectedLayer, 'lines', lineID]);
                  elementsToClipboard.push(Map({
                    elementType: 'lines',
                    element: line
                  }));
                });
              }

              // Copy selected holes
              if (selected.holes.size) {
                selected.holes.forEach(holeID => {
                  let hole = state.getIn(['scene', 'layers', selectedLayer, 'holes', holeID]);
                  elementsToClipboard.push(Map({
                    elementType: 'holes',
                    element: hole
                  }));
                });
              }

              if (elementsToClipboard.length > 0) {
                store.dispatch(copyElements(List(elementsToClipboard)));
              }
            }
          } else {
            // Original behavior for copying properties when Ctrl is not pressed
            let selectedLayer = state.getIn(['scene', 'selectedLayer']);
            let selected = state.getIn(['scene', 'layers', selectedLayer, 'selected']);

            if ( ( mode === MODE_IDLE || mode === MODE_3D_VIEW ) && (selected.holes.size || selected.areas.size || selected.items.size || selected.lines.size)) {
              if (selected.holes.size) {
                let hole = state.getIn(['scene', 'layers', selectedLayer, 'holes', selected.holes.get(0)]);
                store.dispatch(copyProperties(hole.get('properties')));
              }
              else if (selected.areas.size) {
                let area = state.getIn(['scene', 'layers', selectedLayer, 'areas', selected.areas.get(0)]);
                store.dispatch(copyProperties(area.properties));
              }
              else if (selected.items.size) {
                let item = state.getIn(['scene', 'layers', selectedLayer, 'items', selected.items.get(0)]);
                store.dispatch(copyProperties(item.properties));
              }
              else if (selected.lines.size) {
                let line = state.getIn(['scene', 'layers', selectedLayer, 'lines', selected.lines.get(0)]);
                store.dispatch(copyProperties(line.properties));
              }
            }
          }
          break;
        }
        case KEYBOARD_BUTTON_CODE.V:
        {
          if (event.ctrlKey || event.metaKey) {
            // Paste entire elements when Ctrl+V is pressed
            store.dispatch(pasteElements());
          } else {
            // Original behavior for pasting properties when Ctrl is not pressed
            store.dispatch(pasteProperties());
          }
          break;
        }
        case KEYBOARD_BUTTON_CODE.CTRL:
        {
          store.dispatch(setAlterateState());
          break;
        }
      }

    });

    window.addEventListener('keyup', event => {

      let state = stateExtractor(store.getState());
      let mode = state.get('mode');

      switch (event.keyCode) {
        case KEYBOARD_BUTTON_CODE.ALT:
        {
          if (MODE_SNAPPING.includes(mode))
            store.dispatch(toggleSnap(state.snapMask.merge(state.snapMask.get('tempSnapConfiguartion'))));
          break;
        }
        case KEYBOARD_BUTTON_CODE.CTRL:
        {
          store.dispatch(setAlterateState());
          break;
        }
      }

    });

  }
}
