import React, { Component } from 'react';

import { OptionButton } from './option-button';

class OptionList extends Component{

  render(){
    

    return(
      <h2> {this.props.titleText } </h2>
    )
  }


}

export default OptionList;