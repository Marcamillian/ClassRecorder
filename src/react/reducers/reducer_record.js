import { SET_RECORD_TAG_OPTIONS } from '../actions';

export default function( state={}, action ){
  switch( action.type ){
    case SET_RECORD_TAG_OPTIONS:
      return {...state, ['tagOptions']:action.payload.data}
    default:
      return state
  }
}