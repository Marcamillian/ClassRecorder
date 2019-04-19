// import react things
import React from 'react';
import ReactDOM from 'react-dom';

// import redux things
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import promise from 'redux-promise';

import reducers from './reducers';

// import components
import TitleBar from './components/title-bar';
import RecordTagSelect from './components/record-tag-select';

const createStoreWithMiddleware = applyMiddleware(promise)(createStore);

ReactDOM.render(
  <Provider store={ createStoreWithMiddleware(reducers) }>
    <TitleBar />
    <RecordTagSelect />
  </Provider>

,document.querySelector('.container'))