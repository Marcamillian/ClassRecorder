import { TEST_ACTION } from '../actions/index';

export default function(state= {}, action){
  switch(action.type){
    case TEST_ACTION:
      return {...state, ['testValue']:action.payload.data }
    default:
      return state
  } 
}