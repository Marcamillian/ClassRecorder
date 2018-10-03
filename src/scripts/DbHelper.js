'use strict';

class DBHelper{

  static get DATA_URL(){
    const PORT = 3000;
    return `/data/appData.json`;
  }


  // models for data from server

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
      lessonDate: undefined,
      lessonName: 'unnamed lesson'
    }
  }

  static get CLIP_MODEL(){
    return {
      clipId: undefined,
      attachedLesson: undefined,
      attachedStudents: [],
      audioData: undefined
    }
  }

  static get STUDENT_MODEL(){
    return {
      studentId: undefined,
      studentName: undefined,
    }
  }

  // models for locally stored class/lesson/students

  static get OFFLINE_CLASS_MODEL(){
    return{
      className: undefined,
      attachedStudents:[]
    }
  }

  static get OFFLINE_LESSON_MODEL(){
    return{
      lessonName: undefined,
      lessonDate: undefined,
      attachedClass:undefined,
      attachedStudents: [],
    }
  }

  static get OFFLINE_STUDENT_MODEL(){
    return{
      studentName: undefined
    }
  }

  // database table names

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

  static get OFFLINE_CLASS_STORE_NAME(){
    return 'offline-class-store';
  }

  static get OFFLINE_LESSON_STORE_NAME(){
    return 'offline-lesson-store';
  }

  static get OFFLINE_STUDENT_STORE_NAME(){
    return 'offline-student-store';
  }
  
  // static functions

  static maskOfflineIndex(index){
    return `#${index}`;
  }

  static decodeOfflineIndex(maskedIndex){
    return maskedIndex.replace(/#/g, "");
  }

  constructor(){
    // popualte the database
    this.dbPromise = idb.open(DBHelper.RECORDER_DB_NAME,2,(upgradeDb)=>{
      switch(upgradeDb.oldVersion){
        case 0:
          var clipStore = upgradeDb.createObjectStore( DBHelper.CLIP_STORE_NAME, {autoIncrement:true})
          clipStore.createIndex('by-date', 'recordedDate');
          clipStore.createIndex('by-class','classId');
          clipStore.createIndex('by-lesson','lessonId');

          var classStore = upgradeDb.createObjectStore( DBHelper.CLASS_STORE_NAME, {keyPath: 'classId'} );
          classStore.createIndex('by-name', 'className');

          var lessonStore = upgradeDb.createObjectStore( DBHelper.LESSON_STORE_NAME, {keyPath:'lessonId'} )
          lessonStore.createIndex('by-date', 'lessonDate');
          lessonStore.createIndex('by-class', 'attachedClass');

          var studentStore = upgradeDb.createObjectStore( DBHelper.STUDENT_STORE_NAME, {keyPath: 'studentId'});
          studentStore.createIndex('by-name', 'studentName');
        case 1:

          // create the new offline stores
          var offlineClassStore = upgradeDb.createObjectStore( DBHelper.OFFLINE_CLASS_STORE_NAME, {autoIncrement:true})
          offlineClassStore.createIndex('by-name', 'className');

          var offlineLessonStore = upgradeDb.createObjectStore( DBHelper.OFFLINE_LESSON_STORE_NAME, {autoIncrement:true})
          offlineLessonStore.createIndex('by-date', 'lessonDate');
          offlineLessonStore.createIndex('by-name', 'className');
          
          var offlineStudentStore = upgradeDb.createObjectStore( DBHelper.OFFLINE_STUDENT_STORE_NAME, {autoIncrement:true})
          offlineStudentStore.createIndex('by-name', 'studentName')
      }
    })
  }


  // general record
  addRecord(storeName, recordObject){
    return this.dbPromise.then((db)=>{
      let tx = db.transaction(storeName, 'readwrite');
      let listStore = tx.objectStore(storeName);
      
      listStore.put(recordObject);
      return tx.complete;
    })
  }

  // data source record adding

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
    lessonDate = DBHelper.LESSON_MODEL.lessonDate,
    lessonName = DBHelper.LESSON_MODEL.lessonName
  }){
    var dateMilisecond = new Date(lessonDate);
    lessonDate = dateMilisecond.valueOf();

    this.addRecord(DBHelper.LESSON_STORE_NAME, {lessonId, attachedClass, attachedStudents, lessonDate, lessonName})
  }

  addStudent({
    studentId = DBHelper.STUDENT_MODEL.studentId,
    studentName = DBHelper.STUDENT_MODEL.studentName
  }){
    this.addRecord(DBHelper.STUDENT_STORE_NAME, {studentId, studentName})
  }

  addClip({ classId, lessonId, studentIds, audioData }){
    this.addRecord(DBHelper.CLIP_STORE_NAME, {
      classId,
      lessonId,
      studentIds,
      audioData,
      recordedDate:new Date()
    })
  }

  // data source getter functions

  getStudent(studentIndex){
    return this.dbPromise.then((db)=>{
      let tx = db.transaction(DBHelper.STUDENT_STORE_NAME);
      let studentStore = tx.objectStore(DBHelper.STUDENT_STORE_NAME);
      return studentStore.get(studentIndex)
    })
  }

  getStudents(studentIndexArray){
    return Promise.all(studentIndexArray.map( studentId => { return this.getStudent(studentId)} ))
  }

  getClass(classIndex){
    return this.dbPromise.then((db)=>{
      let tx = db.transaction(DBHelper.CLASS_STORE_NAME);
      let classStore = tx.objectStore(DBHelper.CLASS_STORE_NAME);
      return classStore.get(classIndex)
    })
  }

  getLesson(lessonId){
    return this.dbPromise.then( db =>{
      let tx = db.transaction(DBHelper.LESSON_STORE_NAME);
      let lessonStore = tx.objectStore(DBHelper.LESSON_STORE_NAME)

      return lessonStore.get(lessonId)
    })
  }

  getLessons(classId){
    return this.dbPromise.then( db =>{
      let tx = db.transaction(DBHelper.LESSON_STORE_NAME);
      let lessonStore = tx.objectStore(DBHelper.LESSON_STORE_NAME);
      
      return lessonStore.index('by-class').getAll(classId)
    })
  }

  getClasses(){
    return this.dbPromise.then((db)=>{
      let tx = db.transaction(DBHelper.CLASS_STORE_NAME);
      let classStore = tx.objectStore(DBHelper.CLASS_STORE_NAME);
      return classStore.getAll()
    })
  }

  getClip(clipId){
    return this.dbPromise.then((db)=>{
      let tx = db.transaction(DBHelper.CLIP_STORE_NAME);
      let clipStore = tx.objectStore(DBHelper.CLIP_STORE_NAME);
      return clipStore.get(clipId)
    })
  }

  getClipsByClass(classId){
    return this.dbPromise.then((db)=>{
      let tx = db.transaction(DBHelper.CLIP_STORE_NAME);
      let clipStore = tx.objectStore(DBHelper.CLIP_STORE_NAME);

      return clipStore.index('by-class').getAll(classId);
    })
  }

  getClipsByLesson(lessonId){
    return this.dbPromise.then((db)=>{
      let tx = db.transaction( DBHelper.CLIP_STORE_NAME);
      let clipStore = tx.objectStore(DBHelper.CLIP_STORE_NAME);

      return clipStore.index('by-lesson').getAll(lessonId);
    })
  }

  getClipsByStudent(studentId){
    // rework to prevent having to check all clips
    return this.dbPromise.then((db)=>{
      let tx = db.transaction( DBHelper.CLIP_STORE_NAME);
      let clipStore = tx.objectStore(DBHelper.CLIP_STORE_NAME);
      let clips = [];

      clipStore.openCursor()
      .then(function checkClipForStudentId(cursor){

        // exit condtion
        if(cursor == undefined) return 

        let clipObject = cursor.value;
        // check if student attached to the clip
        if( clipObject.studentIds.includes(studentId) ) clips.push(clipObject)
        // progress to the next clip
        return cursor.continue().then( checkClipForStudentId )
      })

      return tx.complete.then( () => clips)
    })
  }

  getCompleteInfo({classId, lessonId, studentIds}){
    
    if(classId == undefined || lessonId == undefined || studentIds == undefined){
      throw new Error(`Complete info not provided | Class:${classId}, lesson:${lessonId}, student:${studentIds}`)
    }

    return Promise.all([
      this.getClass(classId),
      this.getLesson(lessonId),
      this.getStudents(studentIds)
    ])
    .then( infoObjects=>{
      return {
        class:infoObjects[0],
        lesson:infoObjects[1],
        students:infoObjects[2]
      }
    })
  }

  getNames({classId, lessonId, studentIds}){
    // get relevant objects if defined

    return Promise.all([
      this.getClass(classId).then((value)=>{ return value}  , ()=>{return undefined}),
      this.getLesson(lessonId).then((value)=>{ return value}, ()=>{return undefined}),
      this.getStudents(studentIds).then( studentObjects => studentObjects.map(student => student.studentName), ()=>{return undefined} )
    ]).then( responses =>{
      return {
        className: ( responses[0] != undefined) ? responses[0].className : undefined,
        lessonName: ( responses[1] != undefined) ? responses[1].lessonName : undefined,
        studentNames: (responses[2] != undefined) ? responses[2] : undefined
      }
    })


  }

  // OFFLINE DATASTORES

  // add offline data

  addOfflineRecord(storeName, recordObject, idLabel ='id'){
    return this.dbPromise.then((db)=>{
      let tx = db.transaction(storeName, 'readwrite');
      let listStore = tx.objectStore(storeName);
      
      listStore.put(recordObject).then( autoKey =>{
        listStore.openCursor(autoKey).then( cursor =>{
          if(cursor){
            cursor.update({...cursor.value, [idLabel]:DBHelper.maskOfflineIndex(cursor.key) })
            cursor.continue()
          }
        })
      })
      
      return tx.complete;
    })
  }

  addOfflineClass({
    className = DBHelper.OFFLINE_CLASS_MODEL.className,
    attachedStudents = DBHelper.OFFLINE_CLASS_MODEL.attachedStudents
  }){
    this.addOfflineRecord(DBHelper.OFFLINE_CLASS_STORE_NAME, {className}, "classId")
  }

  addOfflineLesson({
    attachedClass = DBHelper.OFFLINE_LESSON_MODEL.attachedClass,
    attachedStudents = DBHelper.OFFLINE_LESSON_MODEL.attachedStudents,
    lessonDate = DBHelper.OFFLINE_LESSON_MODEL.lessonDate,
    lessonName = DBHelper.OFFLINE_.LESSON_MODEL.lessonName
  }){
    var dateMilisecond = (lessonDate) ? new Date(lessonDate) : new Date();
    lessonDate = dateMilisecond.valueOf();
    this.addOfflineRecord(DBHelper.OFFLINE_LESSON_STORE_NAME, {lessonName,lessonDate, attachedClass,attachedStudents}, "lessonId" )
  }

  addOfflineStudent({
    studentName = DBHelper.OFFLINE_STUDENT_MODEL.studentName
  }){
    this.addOfflineRecord(DBHelper.OFFLINE_STUDENT_STORE_NAME, {studentName}, "studentId")
  }


  // retrieve offline data

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