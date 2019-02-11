export { DbHelperOnline }

import {modelClass, modelLesson, modelStudent, modelClip} from './OnlineDataModels.js';

class DbHelperOnline{

  static get STORE_NAMES(){
    return {
      class: 'class-store',
      lesson: 'lesson-store',
      student: 'student-store',
      clip: 'clip-store'
    }
  }

  // constructor
  constructor( dbName ){
    this.dbName = dbName;
  }

  storeInit(upgradeDb){
    switch(upgradeDb.oldVersion){
      case 0:

        var clipStore = upgradeDb.createObjectStore( DbHelperOnline.STORE_NAMES.clip, {autoIncrement: true} )
        clipStore.createIndex('by-date', 'recordedDate');
        clipStore.createIndex('by-class', 'classId')
        clipStore.createIndex('by-lesson', 'lessonId')

        var classStore = upgradeDb.createObjectStore( DbHelperOnline.STORE_NAMES.class, {autoIncrement: true} )
        classStore.createIndex('by-name', 'className');
        
        var lessonStore = upgradeDb.createObjectStore( DbHelperOnline.STORE_NAMES.lesson, {autoIncrement: true})
        lessonStore.createIndex('by-date', 'lessonDate')
        lessonStore.createIndex('by-attached-class-id','attachedClass')

        var studentStore = upgradeDb.createObjectStore( DbHelperOnline.STORE_NAMES.student, {autoIncrement: true})
        studentStore.createIndex('by-name','studentName');
        
    }
  }

  dbPromiseInit(dbPromise){
    this.dbPromise = dbPromise;
  }

  static hasMember(members = [], searchArray = []){

    let result = false;

    members.forEach( member =>{
      if (searchArray.includes(member)) result = true
    })

    return result
  }

  searchRecords(storeName, searchFunction){
    return this.dbPromise.then((db)=>{
      let tx = db.transaction(storeName)
      let recordStore = tx.objectStore(storeName)
      let results = [];

      recordStore.openCursor()
      .then( function searchRecord(cursor){
        // exit condition
        if(cursor == undefined) return 

        let recordObject = cursor.value
        if( searchFunction(recordObject) ) results.push(recordObject)

        return cursor.continue().then( searchRecord)
      })

      return tx.complete.then( ()=> results )
    })
      
  }

  // get methods
  getClasses({
    id = undefined,
    className = undefined,
    attachedStudents = undefined
  }){
    
    function classSearch(classObject){
      return (
        (id == undefined || classObject.classId == id )
        && (className == undefined || classObject.className == className)
        && (attachedStudents == undefined || DbHelperOnline.hasMember( attachedStudents, classObject.attachedStudents))
      )
    }

    return this.searchRecords(DbHelperOnline.STORE_NAMES.class, classSearch)
  }
  
  getLessons({
    id = undefined,
    attachedClass = undefined,
    attachedStudents = undefined,
    date = undefined,
    name = undefined
  }){

    function lessonSearch(lessonObject){
      return (
        (id == undefined || id == lessonObject.lessonId)
        && (attachedClass == undefined || attachedClass == lessonObject.attachedClass)
        && (attachedStudents == undefined || DbHelperOnline.hasMember(attachedStudents, lessonObject.attachedStudents))
        && (date == undefined || date == lessonObject.lessonDate)
        && (name == undefined || name == lessonObject.lessonName)
      )
    }

    return this.searchRecords(DbHelperOnline.STORE_NAMES.lesson, lessonSearch)
  }

  getStudents({
    id = undefined,
    name = undefined
  }){
    
    function studentSearch(studentObject){
      return(
        (id == undefined || id == studentObject.studentId)
        && (name == undefined || name == studentObject.studentName)
      )
    }

    return this.searchRecords(DbHelperOnline.STORE_NAMES.student, studentSearch )
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
    classId = modelClass.classId,
    className = modelClass.className,
    attachedStudents = modelClass.attachedStudents
  }){
    classId = classId.toString();
    attachedStudents = attachedStudents.map( studentId => studentId.toString())

    this.addRecord(DbHelperOnline.STORE_NAMES.class, {classId, className, attachedStudents})
  }

  addLesson({
    lessonId = modelLesson.lessonId,
    attachedClass = modelLesson.attachedClass,
    attachedStudents = modelLesson.attachedStudents,
    lessonDate = modelLesson.lessonDate,
    lessonName = modelLesson.lessonName
  }){
    var dateMillisecond = new Date(lessonDate)
    lessonDate = dateMillisecond.valueOf();

    lessonId = lessonId.toString()
    attachedClass = attachedClass.toString()
    attachedStudents = attachedStudents.map( studentId => studentId.toString())

    this.addRecord(DbHelperOnline.STORE_NAMES.lesson, {lessonId, attachedClass, attachedStudents, lessonDate, lessonName})
  }

  addStudent({
    studentId = modelStudent.studentId,
    studentName = modelStudent.studentName
  }){
    studentId = studentId.toString();

    this.addRecord(DbHelperOnline.STORE_NAMES.student, {studentId, studentName})
  }

  populateDatabase(dataUrl){
    fetch(dataUrl)
    .then( response => { return response.json()} )
    .then( appData =>{
      appData.students.forEach(this.addStudent.bind(this))
      appData.lessons.forEach(this.addLesson.bind(this))
      appData.classes.forEach(this.addClass.bind(this))
    })
    .then(console.log("online database populated"))
  }

}