import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  createRecorder,
  removeRecorder,
  storeAudioChunk,
  saveAudioClip
} from '../actions';

class RecordControls extends Component{

  render(){

    let hasRecorder = this.props.recorder != undefined;
    let audioChunkCount = this.props.audioChunks ? this.props.audioChunks.length : 0;
    let boundToggleRecord = this.toggleRecord.bind(this);
    let boundSaveClip = this.saveClip.bind(this)

    return(
      <div>
        <h2> Record Controls </h2>
        {`Chunks: ${ audioChunkCount }`}<br></br>
        {`hasRecorder: ${ hasRecorder }`}<br></br>
        <button onClick={ boundToggleRecord }> Record </button>
        <button onClick={ boundSaveClip }> Save Clip </button>
      </div>
    )
    
  }

  toggleRecord(){
    
    let recorder = this.props.recorder;

    if( recorder == undefined){
      this.props.createRecorder({ storeAudioCallback: this.props.storeAudioChunk })
    }else{
      recorder.stop()
      this.props.removeRecorder()
    }
    
  }

  saveClip(){
    let {classId, lessonId, studentIds } = this.props.tagsSelected;
    let audioChunks = this.props.audioChunks;

    
    this.props.saveAudioClip({
      attachedClass: classId,
      attachedLesson: lessonId,
      attachedStudents: studentIds,
      audioChunks
    })
  }

}

function mapStateToProps( state ){
  return{
    recorder: state.recordPage.recorder,
    audioChunks: state.recordPage.audioChunks,
    tagsSelected: state.recordPage.tagsSelected
  }
}

export default connect( mapStateToProps,{
  createRecorder,
  removeRecorder,
  storeAudioChunk,
  saveAudioClip
})(RecordControls)