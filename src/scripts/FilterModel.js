'use strict';

class FilterModel{

  constructor( {filterClass = undefined , filterLesson = undefined, filterStudent = undefined} = {} ){

    this.selectedFilter = {
        class: filterClass, // classId from the database
        lesson: filterLesson,  // lessonID from the database
        student: filterStudent // studentID from database
    }
  } 


  get filterSettings(){
    return this.selectedFilter;
  }

  setFilter({filterType, filterOption}){
    
    switch(filterType){
      case "class":
        this.selectedFilter.class = filterOption;
        this.selectedFilter.lesson = undefined;
        this.selectedFilter.student = undefined;
      break;
      case "lesson":
        this.selectedFilter.lesson = filterOption;
        this.selectedFilter.student = undefined;
      break;
      case "student":
        this.selectedFilter.student = filterOption;
      break;
      default:
        throw new Error(`Filter not set: Unknown filter type ${filterType}`)
      break
    }

    return this.selectedFilter;
  }

}

//module.exports = FilterModel;