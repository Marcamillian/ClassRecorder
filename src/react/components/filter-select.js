import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  setFilterOption,
  setFilterSelected
} from '../actions';

import OptionList from './option-list';

class FilterSelect extends Component{
  render(){

    let filterData = this.formatOptionData();

    return(
      <div>
        <OptionList
          titleText="Class"
          section_prefix="class"
          sectionOptionData = { filterData.buttonData["classes"] || [] }
          selectCallback = { filterData.callbacks["classes"] }
        />
        <OptionList
          titleText="Lesson"
          section_prefix="lesson"
          sectionOptionData = { filterData.buttonData["lessons"] || [] }
          selectCallback = { filterData.callbacks["lessons"] }
        />
        <OptionList
          titleText="Student"
          section_prefix="student"
          sectionOptionData = { filterData.buttonData["students"] || [] }
          selectCallback = { filterData.callbacks["students"] }
        />
      </div>
    )
  }

  formatOptionData(){
    const options = this.props.filterOptions || {};
    const filterSelected = this.props.filterSelected || {};
    const buttonData = {};
    const callbacks = {}

    // functions that trigger on selected
    const setFilterOption = this.props.setFilterOption;
    const setFilterSelected = this.props.setFilterSelected;

    if( options.classOptions ){
      buttonData["classes"] = options.classOptions.map( ({ classId, className }) =>{
        let selected = filterSelected.classId == classId;
        return { value: classId, labelText: className, selected }
      })
      // will be bound to the option button
      callbacks["classes"] = function(){
        let newValue = this.props.value;
        // check if selected aleady
        let alreadySelected = filterSelected.classId == newValue;
        // set what the new filter should be
        let updatedFilter = { classId: alreadySelected ? undefined : newValue }

        setFilterOption( updatedFilter )
        setFilterSelected( updatedFilter )
      }
    }
    if( options.lessonOptions ){
      buttonData["lessons"] = options.lessonOptions.map( ({ lessonId, lessonName }) =>{
        let selected = filterSelected.lessonId == lessonId;
        return { value: lessonId, labelText: lessonName, selected }
      })
      callbacks["lessons"] = function(){
        let newValue = this.props.value;
        let alreadySelected = filterSelected.lessonId == newValue;
        let updatedFilter = {
          classId: filterSelected.classId,
          lessonId: alreadySelected ? undefined : newValue
        }
        setFilterOption( updatedFilter )
        setFilterSelected( updatedFilter )
      }
    }
    if( options.studentOptions ){
      buttonData["students"] = options.studentOptions.map( ({ studentId, studentName })=>{
        let selected = filterSelected.studentId == studentId ;
        return {value: studentId, labelText: studentName, selected }
      })

      callbacks["students"] = function(){
        let newValue = this.props.value;
        let alreadySelected = filterSelected.studentId == newValue
        let updatedFilter = {
          classId: filterSelected.classId,
          lessonId: filterSelected.lessonId,
          studentId: alreadySelected ? undefined : newValue
        }

        setFilterSelected( updatedFilter )
      }


    }

    return{
      buttonData,
      callbacks
    }

  }

  componentDidMount(){
    this.props.setFilterOption();
    this.props.setFilterSelected();
  }

}

function mapStateToProps( state ){
  return{
    filterOptions: state.listenPage.filterOptions,
    filterSelected: state.listenPage.filterSelected
  }
}

export default connect( mapStateToProps, { setFilterOption, setFilterSelected } )(FilterSelect);