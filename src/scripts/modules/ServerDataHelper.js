export { ServerDataHelper }

import {modelClass, modelLesson, modelStudent, modelClip} from './OnlineDataModels.js';

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

        var classStore = upgradeDb.createObjectStore( ServerDataHelper.STORE_NAMES.class, {autoIncrement: true} )
        classStore.createIndex('by-name', 'className');
        
        var lessonStore = upgradeDb.createObjectStore( ServerDataHelper.STORE_NAMES.lesson, {autoIncrement: true})
        lessonStore.createIndex('by-date', 'lessonDate')
        lessonStore.createIndex('by-attached-class-id','attachedClass')

        var studentStore = upgradeDb.createObjectStore( ServerDataHelper.STORE_NAMES.student, {autoIncrement: true})
        studentStore.createIndex('by-name','studentName');

        var clipStore = upgradeDb.createObjectStore( ServerDataHelper.STORE_NAMES.clip, {autoIncrement: true} )
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
    id = undefined,
    className = undefined,
    attachedStudents = undefined
  } = {} ){
    let storeName = ServerDataHelper.STORE_NAMES.class;

    // if no objects specified - RETURN ALL
    if( id == undefined && className == undefined && attachedStudents == undefined){
      this.getAllRecords(storeName)
    }

    // if attributes specified - search for them
    function classSearch(classObject){
      return (
        (id == undefined || classObject.classId == id )
        && (className == undefined || classObject.className == className)
        && (attachedStudents == undefined || ServerDataHelper.hasMember( attachedStudents, classObject.attachedStudents))
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
    let storeName = ServerDataHelper.STORE_NAMES.lesson;

    // if no attributes specified - return all
    if( id == undefined && attachedClass == undefined && attachedStudents == undefined, date == undefined, name == undefined){
      return this.getAllRecords(storeName)
    }

    function lessonSearch(lessonObject){
      return (
        (id == undefined || id == lessonObject.lessonId)
        && (attachedClass == undefined || attachedClass == lessonObject.attachedClass)
        && (attachedStudents == undefined || ServerDataHelper.hasMember(attachedStudents, lessonObject.attachedStudents))
        && (date == undefined || date == lessonObject.lessonDate)
        && (name == undefined || name == lessonObject.lessonName)
      )
    }

    return this.searchRecords(storeName, lessonSearch)
  }

  getStudents({
    id = undefined,
    name = undefined
  }={}){
    
    let storeName = ServerDataHelper.STORE_NAMES.student

    // if no attributes specified - return all
    if( id == undefined && name == undefined){
      return this.getAllRecords(storeName)
    }

    function studentSearch(studentObject){
      return(
        (id == undefined || id == studentObject.studentId)
        && (name == undefined || name == studentObject.studentName)
      )
    }

    return this.searchRecords(storeName, studentSearch )
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