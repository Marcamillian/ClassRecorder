import React, { Component } from 'react';
import { connect } from 'react-redux';

import{
  setClipsSelected
}from '../actions'

import ClipList from './clip-list';

class ClipContainer extends Component{

  render(){

    // TODO : pass data to ClipList for rendering

    let boundClipFilter = this.applyClipFilter.bind(this)
    console.log(this.props.clipsSelected)
    return(
      <div>
        <button onClick={boundClipFilter}> Filter Clips </button>
        <ClipList />    
      </div>
      

    )
  }

  applyClipFilter(){
    this.props.setClipsSelected( this.props.filterSelected )
  }

}

function mapStateToProps( state ){
  return{
    clipsSelected: state.listenPage.clipsSelected,
    filterSelected: state.listenPage.filterSelected
  }
}

export default connect(mapStateToProps, { setClipsSelected })(ClipContainer);