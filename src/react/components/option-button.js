import React, { Component } from 'react';

class OptionButton extends Component{
  
  render(){

    const labelText = this.props.label_text;
    const targetId = this.props.value;
    const isSelected = this.props.selected || false;
    const optionId = this.props.option_id;
    const changeFunction = this.props.changeFunction.bind(this)
    
    return(
      <div className="option-button">
        
        <input id={optionId} type="checkbox" value={targetId} onChange={changeFunction} checked={isSelected}></input>
        <label htmlFor={optionId}> {labelText} </label>
      </div>
    )

    
  }

}

export default OptionButton