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

    nextPage(){
      
      if(this.currentPageIndex < this.pages.length){
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

    getPage(){
      return this.pages[this.currentPageIndex]
    }

    static getPageNames(){
      return this.pages.slice(0)
    }

}

module.exports = StudentSelectPageModel;