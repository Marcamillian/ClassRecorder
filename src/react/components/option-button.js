import React, { Component } from 'react';

class OptionButton extends Component{
  
  render(){

    const labelText = this.props.label_text;
    const targetId = this.props.value;
    const isSelected = this.props.selected || false;
    const changeFunction = this.props.changeFunction.bind(this)

    return(
      <div>
        <input type="checkbox" value={targetId} checked={this.checked} onChange={changeFunction} checked={isSelected}></input>
        <label> {labelText} </label>
      </div>
    )

    
  }

}

export default OptionButton