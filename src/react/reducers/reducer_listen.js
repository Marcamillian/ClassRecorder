import {
  SET_FILTER_OPTIONS,
  SET_FILTER_SELECTED,
  SET_CLIPS_SELECTED
} from '../actions'

export default function( state={}, action ){
  switch (action.type ){
    case SET_FILTER_OPTIONS:
      return {...state, ['filterOptions']:action.payload.data }
    break;
    case SET_FILTER_SELECTED:
      return {...state, ['filterSelected']:action.payload.data }
    break;
    case SET_CLIPS_SELECTED:
      return {...state, ['clipsSelected']:action.payload.data }
    break;
    default:
      return state;
    break;
  }
}