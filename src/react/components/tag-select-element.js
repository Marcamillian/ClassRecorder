import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  setRecordTagOptions,
  setRecordSelectedTags
} from "../actions"

import OptionList from './option-list';

class TagSelectElement extends Component{
  
  render(){
    // class list
    let optionData = this.formatOptionData();

    return(
      <div>
        <OptionList
          titleText="Classes"
          section_prefix="class"
          sectionOptionData= { optionData.buttonData["classes"] || [] }
          selectCallback= { optionData.callbacks["classes"] } 
        />
        <OptionList
          titleText="Lessons"
          section_prefix="lesson"
          sectionOptionData= { optionData.buttonData["lessons"] || [] }
          selectCallback= { optionData.callbacks["lessons"] } 
        />
        <OptionList
          titleText="Students"
          section_prefix="students"
          sectionOptionData= { optionData.buttonData["students"] || [] }
          selectCallback= { optionData.callbacks["students"] } 
        />
      </div>
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
        let selected = selectedTags.classId == classId;
        return { value: classId, labelText: className, selected }
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
        let selected = selectedTags.lessonId == lessonId
        return { value: lessonId, labelText: lessonName, selected }
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
        let selected = selectedTags.studentIds.includes(studentId)
        return { value: studentId, labelText: studentName, selected }
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

  componentDidMount(){
    this.props.setRecordTagOptions();
    this.props.setRecordSelectedTags()
  }

}

function mapStateToProps( state ){
  return{
    tagOptions: state.recordPage.tagOptions,
    tagsSelected: state.recordPage.tagsSelected
  }
}

export default connect( mapStateToProps, {setRecordSelectedTags, setRecordTagOptions})(TagSelectElement)