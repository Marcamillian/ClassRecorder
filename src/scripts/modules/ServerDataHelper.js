export { ServerDataHelper }

import {modelClass, modelLesson, modelStudent, modelClip} from './DataModels_Server.js';

class ServerDataHelper{

  static get STORE_NAMES(){
    return {
      class: 'server-class-store',
      lesson: 'server-lesson-store',
      student: 'server-student-store',
      clip: 'server-clip-store'
    }
  }

  // constructor
  constructor( dbName ){
    this.dbName = dbName;
  }

  storeInit(upgradeDb){
    switch(upgradeDb.oldVersion){
      case 0:

        var classStore = upgradeDb.createObjectStore( ServerDataHelper.STORE_NAMES.class, {keyPath: 'classId'} )
        classStore.createIndex('by-name', 'className');
        
        var lessonStore = upgradeDb.createObjectStore( ServerDataHelper.STORE_NAMES.lesson, {keyPath: 'lessonId'})
        lessonStore.createIndex('by-date', 'lessonDate')
        lessonStore.createIndex('by-attached-class-id','attachedClass')

        var studentStore = upgradeDb.createObjectStore( ServerDataHelper.STORE_NAMES.student, {keyPath: 'studentId'})
        studentStore.createIndex('by-name','studentName');

        var clipStore = upgradeDb.createObjectStore( ServerDataHelper.STORE_NAMES.clip, {keyPath: 'clipId'} )
        clipStore.createIndex('by-date', 'recordedDate');
        clipStore.createIndex('by-class', 'classId')
        clipStore.createIndex('by-lesson', 'lessonId')
        
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


  getAllRecords(storeName){
    return this.dbPromise.then((db)=>{
      let tx = db.transaction(storeName)
      let recordStore = tx.objectStore(storeName);
      
      return recordStore.getAll()
    })
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
    classId = undefined,
    className = undefined,
    attachedStudents = undefined
  } = {} ){
    let storeName = ServerDataHelper.STORE_NAMES.class;

    // if no objects specified - RETURN ALL
    if( classId == undefined && className == undefined && attachedStudents == undefined){
      this.getAllRecords(storeName)
    }

    // if attributes specified - search for them
    function classSearch(classObject){
      return (
        (classId == undefined || classId == classObject.classId )
        && (className == undefined || classObject.className == className)
        && (attachedStudents == undefined || ServerDataHelper.hasMember( attachedStudents, classObject.attachedStudents))
      )
    }

    return this.searchRecords( storeName, classSearch)
  }
  
  getLessons({
    lessonId = undefined,
    attachedClass = undefined,
    attachedStudents = undefined,
    lessonDate = undefined,
    lessonName = undefined
  }={}){
    let storeName = ServerDataHelper.STORE_NAMES.lesson;

    // if no attributes specified - return all
    if( lessonId == undefined && attachedClass == undefined && attachedStudents == undefined && lessonDate == undefined && lessonName == undefined){
      return this.getAllRecords(storeName)
    }

    function lessonSearch(lessonObject){
      return (
        (lessonId == undefined || lessonId == lessonObject.lessonId)
        && (attachedClass == undefined || attachedClass == lessonObject.attachedClass)
        && (attachedStudents == undefined || ServerDataHelper.hasMember(attachedStudents, lessonObject.attachedStudents))
        && (lessonDate == undefined || lessonDate == lessonObject.lessonDate)
        && (lessonName == undefined || lessonName == lessonObject.lessonName)
      )
    }

    return this.searchRecords(storeName, lessonSearch)
  }

  getStudents({
    studentId = undefined,
    studentName = undefined
  }={}){
    
    let storeName = ServerDataHelper.STORE_NAMES.student

    // if no attributes specified - return all
    if( studentId == undefined && name == undefined){
      return this.getAllRecords(storeName)
    }

    function studentSearch(studentObject){
      return(
        (studentId == undefined || studentId == studentObject.studentId)
        && (studentName == undefined || studentName == studentObject.studentName)
      )
    }

    return this.searchRecords(storeName, studentSearch )
  }

  getClips({
    classId = undefined,
    lessonId = undefined,
    studentId = undefined,
  }){
    let storeName = ServerDataHelper.STORE_NAMES.clip;

    // if no attributes specified - return all
    if( classId == undefined, lessonId == undefined, studentId == undefined){
      return this.getAllRecords(storeName)
    }

    function clipSearch(clipObject){
      return(
        (classId == undefined || classId == clipObject.classId)
        && (lessonId == undefined || lessonId == clipObject.lessonId)
        && (studentId == undefined || studentId == clipObject.studentId)
      )
    }

    return this.searchRecords( storeName, clipSearch )
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

    this.addRecord(ServerDataHelper.STORE_NAMES.class, {classId, className, attachedStudents})
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

    this.addRecord(ServerDataHelper.STORE_NAMES.lesson, {lessonId, attachedClass, attachedStudents, lessonDate, lessonName})
  }

  addStudent({
    studentId = modelStudent.studentId,
    studentName = modelStudent.studentName
  }){
    studentId = studentId.toString();

    this.addRecord(ServerDataHelper.STORE_NAMES.student, {studentId, studentName})
  }

  populateDatabase(dataUrl){
    return fetch(dataUrl)
    .then( response => { return response.json()} )
    .then( appData =>{
      appData.students.forEach(this.addStudent.bind(this))
      appData.lessons.forEach(this.addLesson.bind(this))
      appData.classes.forEach(this.addClass.bind(this))
    })
    .then(console.log("online database populated"))
  }

}