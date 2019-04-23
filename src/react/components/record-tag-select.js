import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  setRecordTagOptions,
  setRecordSelectedTags
} from '../actions';

import OptionButton from './option-button';

import { isRegExp } from 'util';

class RecordTagSelect extends Component{
  render(){
    return(
      <div>
        <h1> Tag Options</h1>
        <div>
          { this.renderTagOptionList() }
        </div>
      </div>
    )
  }

  renderTagOptionList(){
    const options = this.props.tagOptions || {};
    const optionButtonData = {};
    const optionCallbacks = {};
    const selectedTags = this.props.tagsSelected;

    const setSelectedTags = this.props.setRecordSelectedTags;
    const setTagOptions = this.props.setRecordTagOptions;

    if (options.classOptions){
      optionButtonData["classes"] = options.classOptions.map(({classId, className})=>{ return { value:classId, labelText:className} })
      optionCallbacks["classes"] = function(){
        let newValue = this.props.value;

        // if the clicked value was already active - set nothing active
        let classId = (selectedTags.classId != newValue) ? newValue : undefined;
        let updatedTags = { classId }

        setSelectedTags( updatedTags )
        setTagOptions( updatedTags )
      }
    }
    if(options.lessonOptions){
      optionButtonData["lessons"] = options.lessonOptions.map( ({ lessonId, lessonName }) =>{ return { value: lessonId, labelText: lessonName }} )
      optionCallbacks["lessons"] = function(){
        let newValue = this.props.value;
        
        // if the clicked value was already active - set nothing active
        let lessonId = (selectedTags.lessonId != newValue) ? newValue : undefined;
        let updatedTags = {
          classId: selectedTags.classId,
          lessonId
        }

        setSelectedTags( updatedTags )
        setTagOptions( updatedTags ) 
      }
    }
    if(options.studentOptions){
      optionButtonData["students"] = options.studentOptions.map( ({studentId, studentName}) =>{ return { value: studentId, labelText: studentName }} )
      optionCallbacks["students"] = function(){

        let buttonStudentId = this.props.value;
        let updatedTags = {
          classId: selectedTags.classId,
          lessonId: selectedTags.lessonId,
          studentIds: selectedTags.studentIds
        }
        
        if(updatedTags.studentIds.includes( buttonStudentId )){
          updatedTags.studentIds = updatedTags.studentIds.filter( studentId => studentId != buttonStudentId)
        }else{
          updatedTags.studentIds.push( buttonStudentId )
        }

        setSelectedTags( updatedTags )
      
      }
    }

    try{
      return(
        <div>
          {this.renderTagSection({
            sectionLabel:"class",
            sectionTitle:"Classes",
            sectionOptionData: optionButtonData["classes"] || [],
            selectedValues: [selectedTags.classId] || [],
            selectCallback: optionCallbacks["classes"]
          })}
          {this.renderTagSection({
            sectionLabel:"lesson", 
            sectionTitle:"Lessons", 
            sectionOptionData: optionButtonData["lessons"] || [],
            selectedValues: [selectedTags.lessonId ] || [],
            selectCallback: optionCallbacks["lessons"]
          })}
          {this.renderTagSection({
            sectionLabel:"students",
            sectionTitle:"Students",
            sectionOptionData: optionButtonData["students"] || [],
            selectedValues: selectedTags.studentIds || [],
            selectCallback: optionCallbacks["students"]
          })}
        </div>
      )
    }catch(error){
      console.error(error)
      return "nothing to show"
    }
    
    
  }

  renderTagSection({ sectionLabel, sectionTitle, sectionOptionData, selectedValues = [], selectCallback = ()=>{console.log("clicked")} }){
    
    // build a list of the option buttons for section
    let optionItems = sectionOptionData.map( ({value, labelText})=>{
      // check id option buttons should be selected
      let isSelected = selectedValues.includes(value)
      // put the options inside a list item
      return (
        <li key={`${sectionLabel}__${value}`}>
          { this.renderTagOptionButton({ value, labelText, selectCallback, isSelected }) }
        </li>
      )
    })

    return(
      <section>
        <h1> {sectionTitle} </h1>
        <ul>
          { optionItems }
        </ul>
      </section>
    )
  }

  renderTagOptionButton( { value, labelText, selectCallback, isSelected } ){

    return (
      <OptionButton  label_text={ labelText } value={ value } changeFunction={ selectCallback } selected= {isSelected}/>
    )
  }

  showClassNames(){
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

  getSelectedTags(){
    if(this.props.tagsSelected) return this.props.tagsSelected
    else return undefined
  }


  componentDidMount(){
    this.props.setRecordTagOptions();
    this.props.setRecordSelectedTags()
  }
}

function mapStateToProps( state ){  
  console.log(state.recordPage.tagsSelected)
  return {
    tagOptions: state.recordPage.tagOptions,
    tagsSelected: state.recordPage.tagsSelected
  }
}

export default connect( mapStateToProps, { setRecordTagOptions, setRecordSelectedTags })(RecordTagSelect)