import {
  SET_RECORD_TAG_OPTIONS,
  SET_RECORD_SELECTED_TAGS,
  CREATE_RECORDER,
  REMOVE_RECORDER,
  STORE_AUDIO_CHUNK,
  CLEAR_AUDIO_CHUNKS
} from '../actions';

export default function( state={}, action ){
  switch( action.type ){
    case SET_RECORD_TAG_OPTIONS:
      return {...state, ['tagOptions']:action.payload.data}
    break;
    case SET_RECORD_SELECTED_TAGS:
      return {...state, ['tagsSelected']: action.payload.data}
    break;
    case CREATE_RECORDER:
      return {...state, ['recorder']: action.payload.data}
    break;
    case REMOVE_RECORDER:
      return {...state, ['recorder']: undefined }
    break;
    case STORE_AUDIO_CHUNK:
      let currentChunks = state.audioChunks || [];
      currentChunks.push( action.payload.data )

      return {...state, ['audioChunks']: currentChunks }
    case CLEAR_AUDIO_CHUNKS:
      return {...state, ['audioChunks']: undefined}
    break;
    default:
    return state
  }
}