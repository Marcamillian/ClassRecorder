'use strict';

class StudentSelectPageModel {

    constructor( initalPage = 0 ){
        this.currentPageIndex = initalPage;
        this.pages =  ['class', 'lesson', 'student']; // list of pages,
    
        this.selectedOptions = {
            class: undefined, // classId from the database
            lesson: undefined,  // lessonID from the database
            student:[] // studentIDs from the database
        }
    }

    get pageNames(){
      return this.pages.slice(0)
    }

    get currentPage(){
      return this.pages[this.currentPageIndex]
    }

    getSelectedOptions(){
      return this.selectedOptions
    }

    nextPage(option){
      
      if(this.currentPageIndex < this.pages.length-1){
        this.currentPageIndex++;
        return this.pages[this.currentPageIndex]
      }else{
        throw new Error('Page limit reached - At end of page')
        return this.pages.slice(-1)
      }
    }

    prevPage(){
      if(this.currentPageIndex > 0 ){
        this.currentPageIndex --;
        return this.pages[this.currentPageIndex]
      }else{
        throw new Error('Page limit reached - At start of pages')
        return this.pages.slice(0,1);
      }
    }

    selectOption(option){
      let modelSlot = this.selectedOptions[this.pages[this.currentPageIndex]];

      // == dealing with options with more than one value
      if(Array.isArray(modelSlot)){

        // toggle value if already in array
        if(!modelSlot.includes(option)){
          modelSlot.push(option)
        }else{
          // filter out the ones that match (toggle option off)
          modelSlot = modelSlot.filter((optionId)=>{ return optionId != option  })
        }
        
      }else{
        this.selectedOptions[this.pages[this.currentPageIndex]] = option;
      }

      return this.selectedOptions[this.pages[this.currentPageIndex]]
    }

    clearOption(){
      let modelSlot = this.selectedOptions[this.pages[this.currentPageIndex]];

      if(Array.isArray(modelSlot)){ // if the option is an array
        this.selectedOptions[this.pages[this.currentPageIndex]] = []
      }else{
        this.selectedOptions[this.pages[this.currentPageIndex]] = undefined;
      }
    }
    

}

//module.exports = StudentSelectPageModel;