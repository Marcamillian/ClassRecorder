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

  // get methods
  getClass({
    id = undefined,
    className = undefined,
    attachedStudents = undefined
  }){

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


  getClasses(options){

  }

  getLessons(options){

  }

  getStudents(){

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