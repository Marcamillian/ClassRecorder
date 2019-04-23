import {
  SET_RECORD_TAG_OPTIONS,
  SET_RECORD_SELECTED_TAGS
} from '../actions';

export default function( state={}, action ){
  switch( action.type ){
    case SET_RECORD_TAG_OPTIONS:
      return {...state, ['tagOptions']:action.payload.data}
    case SET_RECORD_SELECTED_TAGS:
      return {...state, ['tagsSelected']: action.payload.data}
    break;
    default:
    return state
  }
}