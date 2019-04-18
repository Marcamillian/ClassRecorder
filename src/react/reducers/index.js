import { combineReducers } from 'redux';

import TestReducer from './reducer_test';

const rootReducer = combineReducers({
  testData: TestReducer
})

export default rootReducer;