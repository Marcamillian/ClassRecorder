import React, { Component } from 'react';
import { connect } from 'react-redux';


import { testAction } from '../actions'

class TitleBar extends Component{
  render(){
    return(
      <div className="title-bar">
        <h1> Class recorder</h1>
        <p>testing action: {this.props.testValue}</p> 
      </div> 
    )
  }

  componentDidMount(){
    this.props.testAction("redux setting value")
    console.log("something happening here")
  }

}

function mapStateToProps(state, ownProps){
  console.log("mapping state" , state);
  const testValue = state.testData.testValue || "didn't work";
  return { testValue }
}

export default connect(mapStateToProps, {testAction})(TitleBar);