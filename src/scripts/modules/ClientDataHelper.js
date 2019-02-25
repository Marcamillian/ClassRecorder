export { ClientDataHelper }

import {modelClass, modelLesson, modelStudent, modelClip} from './DataModels_Client.js';


class ClientDataHelper{

  static get STORE_NAMES(){
    return {
      class: 'client-class-store',
      lesson: 'client-lesson-store',
      student: 'client-student-store'
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
        if( searchFunction(recordObject) ) results.push(recordObject)

        // continue the search
        return cursor.continue().then( searchRecord )
      })

      return tx.complete.then( () => results )
    })
  }
  
  getClass({
    id = undefined,
    className = undefined,
    attachedStudents = undefined
  }){
    function classSearch(classObject){
      return(
        (id == undefined || i)
      )
    }
  }
  
  getLesson({
    id = undefined,
    inClass = undefined,
    student = undefined,
    date = undefined,
    lesson
  }){

  }

  getStudent({
    id = undefined,
    name = undefined
  }){
    
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

    this.addRecord(ClientDataHelper.STORE_NAMES.lesson, {lessonId, attachedClass, attachedStudents, lessonDate, lessonName})
  }

  addStudent({
    studentName = modelStudent.studentName
  }){
    this.addRecord(ClientDataHelper.STORE_NAMES.student, {studentId})
  }

}