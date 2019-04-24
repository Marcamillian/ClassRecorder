import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  createRecorder,
  removeRecorder
} from '../actions'

class RecordButton extends Component{

  render(){

    let hasRecorder = this.props.recorder != undefined;
    let boundRecordToggle = recordToggle.bind(this)

    return(
      <div>
        {`hasRecorder: ${ hasRecorder }`}
        <button onClick={boundRecordToggle}> Record </button>
      </div>
    )
  }

}

function recordToggle(){
  
  let recorder = this.props.recorder;

  if (recorder == undefined){
    this.props.createRecorder()
  }else{
    recorder.stop()
    this.props.removeRecorder()
  }
  
}

function mapStateToProps( state ){
  return {
    recorder: state.recordPage.recorder,
    tagsSelected: state.recordPage.tagsSelected
  }
}

export default connect(mapStateToProps, { createRecorder, removeRecorder })(RecordButton);