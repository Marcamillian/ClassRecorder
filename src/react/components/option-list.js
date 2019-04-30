import React, { Component } from 'react';

import OptionButton from './option-button';

class OptionList extends Component{

  render(){

    let optionItems = this.renderOptions();

    return(
      <section>
        <h2> {this.props.titleText } </h2>
        <ul>
          { optionItems }
        </ul>
      </section>
    )
  }

  renderOptions(){
    let optionData = this.props.sectionOptionData;
    let selectCallback = this.props.selectCallback;
    let sectionPrefix = this.props.section_prefix;

    return optionData.map( ({value, labelText, selected})=>{
      let optionId = `${sectionPrefix}__${value}`

      return(
        <li key={ optionId }>
          <OptionButton
            option_id={ optionId }
            label_text={ labelText }
            value={ value }
            selected= { selected } 
            changeFunction={ selectCallback }
          />
        </li>
      )
    })
  }


}

export default OptionList;