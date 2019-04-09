export default class StudentSelectPageModel {

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
    let optionName = this.pages[this.currentPageIndex]
    let modelSlot = this.selectedOptions[optionName];

    // == dealing with options with more than one value
    if(Array.isArray(modelSlot)){

      // toggle value if already in array
      if(!modelSlot.includes(option)){
        modelSlot.push(option)
      }else{
        // filter out the ones that match (toggle option off)
        this.selectedOptions[optionName] = modelSlot.filter((optionId)=>{ return optionId != option  })
      }
      
    }else{
      this.selectedOptions[optionName] = option;
    }

    return this.selectedOptions[optionName]
  }

  clearOption(givenOptionName = this.pages[this.currentPageIndex]){

    const givenOptionPosition = this.pages.indexOf(givenOptionName);
    // TODO : catch unmatched case? -1

    // clear options following and including the one named
    for (var i= givenOptionPosition; i < this.pages.length; i++){

      var optionName = this.pages[i];

      if(Array.isArray(this.selectedOptions[optionName])){ // if the option is an array
        this.selectedOptions[optionName] = []
      }else{
        this.selectedOptions[optionName] = undefined;
      }

    }

    
  }
    
}