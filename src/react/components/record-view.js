import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  setRecordTagOptions,
  setRecordSelectedTags
} from "../actions"

import OptionList from './option-list';

class RecordView extends Component{
  
  render(){
    // class list
    let optionData = this.formatOptionData();

    return(
      <OptionList
        titleText="Classes"
        labelText="class"
        sectionOptionData= { optionData.buttonData["classes"] || [] }
        selectCallback= { optionData.callbacks["classes"] } 
      />
    )
  }

  formatOptionData(){
    const options = this.props.tagOptions || {};
    const selectedTags = this.props.tagsSelected || {};
    const buttonData = {};
    const callbacks = {};

    // functions that would be triggered on click
    const setSelectedTags = this.props.setRecordSelectedTags;
    const setTagOptions = this.props.setRecordTagOptions;
    
    // if there are classes available
    if (options.classOptions){
      
      // format the class data for option button
      buttonData["classes"] = options.classOptions.map( ({classId, className}) =>{
        return { value: classId, labelText: className }
      })

      // function that would evntually be bound to the button
      callbacks["classes"] = function(){

        let newValue = this.props.value;
        // check if option is already selected
        let alreadySelected = selectedTags.classId == newValue;
        // set what the new selected class should be
        let updatedTags = { classId: alreadySelected ? undefined : newValue }

        setSelectedTags( updatedTags ); // updated which were selected
        setTagOptions( updatedTags ); // update the options provided
      }

    }
    // if there are lessons available
    if (options.lessonOptions){
      // format lesson data for option button
      buttonData["lessons"] = options.lessonOptions.map( ({lessonId, lessonName})=>{
        return { value: lessonId, labelText: lessonName }
      })

      // function that will be bound to option button
      callbacks["lessons"] = function(){
        let newValue = this.props.value;
        let alreadySelected = selectedTags.lessonId == newValue;
        let updatedTags = {
          classId: selectedTags.classId,
          lessonId: alreadySelected ? undefined : newValue
        }

        setSelectedTags( updatedTags )
        setTagOptions( updatedTags )
      }

    }
    // if there are student available
    if (options.studentOptions){
      buttonData["students"] = options.studentOptions.map( ({studentId, studentName})=>{
        return { value: studentId, labelText: studentName }
      })

      callbacks["students"] = function(){
        let newValue = this.props.value;

        let updatedTags = Object.assign({}, selectedTags);

        if(updatedTags.studentIds.includes( newValue )){
          // remove the value from the array
          updatedTags.studentIds = updatedTags.studentIds.filter( studentId => studentId != newValue)
        }else{
          // add the value from the array
          updatedTags.studentIds.push( newValue )
        }

        setSelectedTags( updatedTags )
      }
    }

    return {
      buttonData,
      callbacks
    }

  }

}

function mapStateToProps( state ){
  return{
    tagOptions: state.recordPage.tagOptions,
    tagsSelected: state.recordPage.tagsSelected
  }
}

export default connect( mapStateToProps, {setRecordSelectedTags, setRecordTagOptions})(RecordView)