'use strict';

class DBHelper{

  static get DATA_URL(){
    const PORT = 3000;
    return `http://localhost:${PORT}/data/appData.json`;
  }

  static get STUDENT_MODEL(){
    return {
      studentId: undefined,
      studentName: undefined,
    }
  }

  static get CLASS_MODEL(){
    return {
      classId: undefined,
      className: undefined,
      attachedStudents: []
    }
  }

  static get LESSON_MODEL(){
    return {
      lessonId: undefined,
      attachedClass: undefined,
      attachedStudents: [],
      lessonDate: undefined
    }
  }

  static get CLIP_MODEL(){
    return {
      attachedLesson: undefined,
      attachedStudents: [],
      audioData: undefined
    }
  }

  static get RECORDER_DB_NAME(){
    return 'recorder-db'
  }

  static get CLIP_STORE_NAME(){
    return 'clip-store';
  }

  static get STUDENT_STORE_NAME(){
    return 'student-store'
  }

  static get CLASS_STORE_NAME(){
    return 'class-store'
  }

  static get LESSON_STORE_NAME(){
    return 'lesson-store'
  }

  constructor(){
    this.dbPromise = idb.open(DBHelper.RECORDER_DB_NAME,1,(upgradeDb)=>{
      switch(upgradeDb.oldVersion){
        case 0:
          var clipStore = upgradeDb.createObjectStore( DBHelper.CLIP_STORE_NAME, {autoIncrement:true})

          var studentStore = upgradeDb.createObjectStore( DBHelper.STUDENT_STORE_NAME, {keyPath: 'studentId'});
          studentStore.createIndex('by-name', 'studentName');

          var classStore = upgradeDb.createObjectStore( DBHelper.CLASS_STORE_NAME, {keyPath: 'classId'} );
          classStore.createIndex('by-name', 'className');

          var lessonStore = upgradeDb.createObjectStore( DBHelper.LESSON_STORE_NAME, {keyPath:'lessonId'} )
          lessonStore.createIndex('by-date', 'lessonDate');
          lessonStore.createIndex('by-class', 'attachedClass');  
      }
    })
  }

  addRecord(storeName, recordObject){
    this.dbPromise.then((db)=>{
      let tx = db.transaction(storeName, 'readwrite');
      let listStore = tx.objectStore(storeName);
      listStore.put(recordObject);
      return tx.complete;
    })
  }

  addClass({
    classId = DBHelper.CLASS_MODEL.classId,
    className = DBHelper.CLASS_MODEL.className,
    attachedStudents = DBHelper.CLASS_MODEL.attachedStudents
  } = {}){
    this.addRecord(DBHelper.CLASS_STORE_NAME, {classId, className, attachedStudents});
  }

  addLesson({
    lessonId = DBHelper.LESSON_MODEL.lessonId,
    attachedClass = DBHelper.LESSON_MODEL.attachedClass,
    attachedStudents = DBHelper.LESSON_MODEL.attachedStudents,
    lessonDate = DBHelper.LESSON_MODEL.lessonDate
  }){
    var dateMilisecond = new Date(lessonDate);
    lessonDate = dateMilisecond.valueOf();

    this.addRecord(DBHelper.LESSON_STORE_NAME, {lessonId, attachedClass, attachedStudents, lessonDate})
  }

  addStudent({
    studentId = DBHelper.STUDENT_MODEL.studentId,
    studentName = DBHelper.STUDENT_MODEL.studentName
  }){
    this.addRecord(DBHelper.STUDENT_STORE_NAME, {studentId, studentName})
  }

  addClip({
    attachedLesson = DBHelper.CLIP_MODEL.attachedLesson,
    attchedStudents = DBHelper.CLIP_MODEL.attachedStudents,
    audioData = DBHelper.CLIP_MODEL.audioData
  }){
    this.addRecord(DBHelper.CLIP_STORE_NAME, {
      attachedLesson,
      attachedStudents,
      audioData,
      recordedDate:new Date()
    })
  }

  getStudentsFromClass(){

  }

  getClasses(){
    return this.dbPromise.then((db)=>{
      let tx = db.transaction(DBHelper.CLASS_STORE_NAME);
      let classStore = ts.objectStore(DBHelper.CLASS_STORE_NAME);
      return classStore.getAll()
    })
  }

  populateDatabase(){
    fetch(DBHelper.DATA_URL)
    .then((response) =>{ return response.json() })
    .then((appData)=>{
      
      // store all the students
      appData.students.forEach(this.addStudent.bind(this))

      // store all the classes
      appData.classes.forEach(this.addClass.bind(this))

      // store all the lessons
      appData.lessons.forEach(this.addLesson.bind(this))
    })
    .then(()=>{console.log("database populated")})
  }

}