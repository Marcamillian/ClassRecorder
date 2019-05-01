// import react things
import React from 'react';
import ReactDOM from 'react-dom';

// import redux things
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import promise from 'redux-promise';

import reducers from './reducers';

// import components
import RecordView from './components/record-view';
import ListenView from './components/listen-view';

const createStoreWithMiddleware = applyMiddleware(promise)(createStore);

ReactDOM.render(
  <Provider store={ createStoreWithMiddleware(reducers) }>
    <ListenView />
  </Provider>

,document.querySelector('.container'))
