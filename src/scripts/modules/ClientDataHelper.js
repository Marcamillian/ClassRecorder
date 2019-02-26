export { ClientDataHelper }

import {modelClass, modelLesson, modelStudent, modelClip} from './DataModels_Client.js';


class ClientDataHelper{

  static get STORE_NAMES(){
    return {
      class: 'client-class-store',
      lesson: 'client-lesson-store',
      student: 'client-student-store',
      clip: 'client-clip-store'
    }
  }

  // constructor
  constructor( dbName ){
    this.dbPromise = undefined;
  }

  storeInit(upgradeDb){
    switch(upgradeDb.oldVersion){
      case 0:

        var classStore = upgradeDb.createObjectStore( ClientDataHelper.STORE_NAMES.class, {autoIncrement: true} )
        classStore.createIndex('by-name', 'className');
        classStore.createIndex('by-class-id', 'classId');

        
        var lessonStore = upgradeDb.createObjectStore( ClientDataHelper.STORE_NAMES.lesson, {autoIncrement: true})
        lessonStore.createIndex('by-date', 'lessonDate')
        lessonStore.createIndex('by-name', 'className')
        lessonStore.createIndex('by-lesson-id', 'lessonId')
        lessonStore.createIndex('by-attached-class-id','attachedClass')

        var studentStore = upgradeDb.createObjectStore( ClientDataHelper.STORE_NAMES.student, {autoIncrement: true})
        studentStore.createIndex('by-name','studentName');
        studentStore.createIndex('by-student-id', 'studentId')

        var clipStore = upgradeDb.createObjectStore( ClientDataHelper.STORE_NAMES.clip, {autoIncrement: true} )
        clipStore.createIndex('by-date', 'recordedDate');
        clipStore.createIndex('by-class', 'classId')
        clipStore.createIndex('by-lesson', 'lessonId')
        
    }
  }

  dbPromiseInit(dbPromise){
    this.dbPromise = dbPromise;
  }

  // utilities
  static hasMember(members = [], searchArray = []){
    let result = false;
    members.forEach( member =>{
      if (searchArray.includes(member)) result = true
    })

    return result
  }

  static maskId(){

  }

  static revealId(){

  }

  // get methods
  
  getAllRecords(storeName){
    return this.dbPromise.then((db)=>{
      let tx = db.transaction(storeName)
      let recordStore = tx.objectStore(storeName)

      return recordStore.getAll()
    })
  }
  
  searchRecords(storeName, searchFunction){
    return this.dbPromise.then( db =>{
      let tx = db.transaction(storeName)
      let recordStore = tx.objectStore(storeName)
      let results = [];

      recordStore.openCursor()
      .then( function searchRecord(cursor){
        // exit condition
        if(cursor == undefined) return 
        
        //see if object passes
        let recordObject = cursor.value;
        let recordKey = cursor.key
        if( searchFunction(recordObject, recordKey) ) results.push(recordObject)

        // continue the search
        return cursor.continue().then( searchRecord )
      })

      return tx.complete.then( () => results )
    })
  }
  
  getClasses({
    id = undefined,
    className = undefined,
    attachedStudents = undefined
  }={}){

    // !! TODO : In Returning the objects we need to append their key?
    // !! TODO : Where should we deal with the mask of the id (having a hash on it)
    /*    -- outside ID comes in (serching for server data)
          -- Don't want to return a false positive
          -- Must include the hash at the search level
    */

    let storeName = ClientDataHelper.STORE_NAMES.class;

    if( id == undefined && className == undefined && attachedStudents == undefined ){
      return this.getAllRecords(storeName)
    }

    // if attributes stated - create a function to determine 
    function classSearch(classObject, classKey){
      return(
        (id == undefined || id == classKey)
        && (className == undefined || className == classObject.className )
        && (attachedStudents == undefined || ClientDataHelper.hasMember( attachedStudents, classObject.attachedStudents))
      )
    }

    return this.searchRecords( storeName, classSearch)
  }
  
  getLessons({
    id = undefined,
    attachedClass = undefined,
    attachedStudents = undefined,
    date = undefined,
    name = undefined
  }={}){

    let storeName = ClientDataHelper.STORE_NAMES.lesson;

    if( id == undefined && attachedClass == undefined && attachedStudents == undefined && date == undefined && name == undefined  ){
      return this.getAllRecords(storeName)
    }


  }

  getStudents({
    id = undefined,
    studentName = undefined
  }={}){

    let storeName = ClientDataHelper.STORE_NAMES.student;

    if( id == undefined && studentName == undefined ){
      return this.getAllRecords(storeName)
    }
    
  }

  // put methods (create)
  addRecord(storeName, recordObject){
    return this.dbPromise.then((db)=>{
      let tx = db.transaction(storeName, 'readwrite');
      let objectStore = tx.objectStore(storeName);

      objectStore.put(recordObject);
      return tx.complete;
    })
  }

  addClass({
    className = modelClass.className,
    attachedStudents = modelClass.attachedStudents
  }){
    attachedStudents = attachedStudents.map( studentId => studentId.toString())

    this.addRecord(ClientDataHelper.STORE_NAMES.class, {className, attachedStudents})
  }

  addLesson({
    attachedClass = modelLesson.attachedClass,
    attachedStudents = modelLesson.attachedStudents,
    lessonDate = modelLesson.lessonDate,
    lessonName = modelLesson.lessonName
  }){
    var dateMillisecond = new Date(lessonDate);
    lessonDate = dateMillisecond.valueOf();

    attachedClass = attachedClass.toString();
    attachedStudents = attachedStudents.map( studentId => studentId.toString())

    this.addRecord(ClientDataHelper.STORE_NAMES.lesson, { attachedClass, attachedStudents, lessonDate, lessonName})
  }

  addStudent({
    studentName = modelStudent.studentName
  }){
    this.addRecord(ClientDataHelper.STORE_NAMES.student, {studentName})
  }

  populateTestData(){
    this.addClass({className:"Test Class 1", attachedStudents:['2','#1'] });
    this.addClass({className:"Test Class 2", attachedStudents:['1','2','3'] });

    this.addLesson({lessonName:"Test lesson 1", attachedClass:'#1', attachedStudents:['2','#1'] });
    this.addLesson({lessonName:"Test lesson 2", attachedClass:1, attachedStudents:['1','2','3'] });

    this.addStudent({studentName:"Test Student1"});
    this.addStudent({studentName:"Test Student2"});

    console.log( "populated test client data")
  }

}