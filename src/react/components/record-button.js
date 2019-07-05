import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  createRecorder,
  removeRecorder,
  storeAudioChunk
} from '../actions'

class RecordButton extends Component{

  render(){

    let hasRecorder = this.props.recorder != undefined;
    let boundRecordToggle = recordToggle.bind(this)
    let audioChunkCount = this.props.audioChunks ? this.props.audioChunks.length : 0;

    return(
      <div>
        {`chunks: ${audioChunkCount}`} <br></br>
        {`hasRecorder: ${ hasRecorder }`} <br></br>
        <button onClick={boundRecordToggle}> Record </button>
      </div>
    )
  }

}

function recordToggle(){
  
  let recorder = this.props.recorder;

  if (recorder == undefined){
    this.props.createRecorder({ storeAudioCallback: this.props.storeAudioChunk })
  }else{
    recorder.stop()
    this.props.removeRecorder()
  }
  
}

function mapStateToProps( state ){
  return {
    recorder: state.recordPage.recorder,
    tagsSelected: state.recordPage.tagsSelected,
    audioChunks: state.recordPage.audioChunks
  }
}

export default connect(mapStateToProps, { createRecorder, removeRecorder, storeAudioChunk })(RecordButton);