import { combineReducers } from 'redux';

import TestReducer from './reducer_test';
import RecordReducer from './reducer_record';
import ListenReducer from './reducer_listen';

const rootReducer = combineReducers({
  testData: TestReducer,
  recordPage: RecordReducer,
  listenPage: ListenReducer
})

export default rootReducer;