import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  setRecordTagOptions,
  setRecordSelectedTags
} from "../actions"

import TagSelectElement from './tag-select-element';
import RecordControls from './record-controls';

class RecordView extends Component{
  
  render(){

    return(
      <div>
        <RecordControls />
        <TagSelectElement />
      </div>
    )
  }

}


export default RecordView