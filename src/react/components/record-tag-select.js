import React, { Component } from 'react';
import { connect } from 'react-redux';

import { setRecordTagOptions } from '../actions';
import { isRegExp } from 'util';

class RecordTagSelect extends Component{
  render(){
    return(
      <div>
        <h1> Tag Options</h1>
        <div>
          {this.doSomething()}
        </div>
      </div>
    )
  }

  doSomething(){
    let classList = []
    
    if(this.props.tagOptions){
      this.props.tagOptions.classOptions.forEach(({className})=>{
        classList.push(className)
      })
    }else{
      classList.push("no classes")
    }

    return classList;
  }

  componentDidMount(){
    this.props.setRecordTagOptions();
    
  }
}

function mapStateToProps( state ){
  return {
    tagOptions: state.recordPage.tagOptions
  }
}

export default connect( mapStateToProps, {setRecordTagOptions})(RecordTagSelect)