import { combineReducers } from 'redux';

import TestReducer from './reducer_test';
import RecordReducer from './reducer_record';

const rootReducer = combineReducers({
  testData: TestReducer,
  recordPage: RecordReducer
})

export default rootReducer;