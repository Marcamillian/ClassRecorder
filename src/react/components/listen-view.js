import React, { Component } from 'react';
import { connect } from 'react-redux';

import FilterSelect from './filter-select';
import ClipContainer from './clip-container';


class ListenView extends Component{
  render(){
    return(
      <div>
        <h1> Listen View </h1>
        <FilterSelect />
        <ClipContainer />
      </div> 
    )
  }
}

export default ListenView