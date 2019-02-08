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
    this.dbPromise = idb.openDb(DBHelper.RECORDER_DB_NAME,3,(upgradeDb)=>{
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
          offlineStudentStore.createIndex('by-name', 'studentName');
        case 2: 
          var offlineClassStore = upgradeDb.transaction.objectStore(DBHelper.OFFLINE_CLASS_STORE_NAME);
          offlineClassStore.createIndex('by-class-id','classId');

          var offlineLessonStore = upgradeDb.transaction.objectStore(DBHelper.OFFLINE_LESSON_STORE_NAME);
          offlineLessonStore.createIndex('by-lesson-id','lessonId');
          offlineLessonStore.createIndex('by-attached-class-id','attachedClass')

          var offlineStudentStore = upgradeDb.transaction.objectStore(DBHelper.OFFLINE_STUDENT_STORE_NAME);
          offlineStudentStore.createIndex('by-student-id','studentId');

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
    classId = classId.toString();
    attachedStudents = attachedStudents.map( studentId => studentId.toString())

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

    lessonId = lessonId.toString();
    attachedClass = attachedClass.toString();
    attachedStudents = attachedStudents.map( studentId => studentId.toString())


    this.addRecord(DBHelper.LESSON_STORE_NAME, {lessonId, attachedClass: attachedClass, attachedStudents, lessonDate, lessonName})
  }

  addStudent({
    studentId = DBHelper.STUDENT_MODEL.studentId,
    studentName = DBHelper.STUDENT_MODEL.studentName
  }){
    studentId = studentId.toString();

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

      let tx = db.transaction([DBHelper.STUDENT_STORE_NAME, DBHelper.OFFLINE_STUDENT_STORE_NAME]);
      let studentStore = tx.objectStore(DBHelper.STUDENT_STORE_NAME);
      let offlineStudentStore = tx.objectStore(DBHelper.OFFLINE_STUDENT_STORE_NAME);

      // get student from student stores (network or offline)
      return Promise.all([
        studentStore.get(studentIndex),
        offlineStudentStore.index('by-student-id').get(studentIndex)
      ])
      // flatten the array of results
      .then( resultsArray =>{ return resultsArray.flat()})
      // remove undefined 
      .then( studentObjects => studentObjects.filter( studentObject => studentObject != undefined))
      // only return 1 result
      .then( filteredObjects => filteredObjects[0])
    })
  }

  getStudents(studentIndexArray){

    return Promise.all(studentIndexArray.map( studentId => { return this.getStudent(studentId)} ))
  }

  getAllStudents(){
    return this.dbPromise.then((db)=>{
      const tx = db.transaction([DBHelper.STUDENT_STORE_NAME, DBHelper.OFFLINE_STUDENT_STORE_NAME]);
      const studentStore = tx.objectStore(DBHelper.STUDENT_STORE_NAME);
      const offlineStudentStore = tx.objectStore(DBHelper.OFFLINE_STUDENT_STORE_NAME);

      // get all the students (network and offline)
      return Promise.all([
        studentStore.getAll(),
        offlineStudentStore.getAll()
      ])
      // flatten the array 
      .then( resultsArray => resultsArray.flat())
      // filter out the undefined results
      .then( studentObjects => studentObjects.filter( studentObject => studentObject != undefined))

    })
  }

  getClass(classIndex){

    return this.dbPromise.then((db)=>{
      let tx = db.transaction([DBHelper.CLASS_STORE_NAME, DBHelper.OFFLINE_CLASS_STORE_NAME]);
      let classStore = tx.objectStore(DBHelper.CLASS_STORE_NAME);
      let offlineClassStore = tx.objectStore(DBHelper.OFFLINE_CLASS_STORE_NAME)

      // get all the results from 
      return Promise.all([
        classStore.get(classIndex),
        offlineClassStore.index('by-class-id').get(classIndex)
      //flatten the results from the two arrays
      ]).then( resultArray =>{
        return resultArray.flat()
      // remove the undefined elements
      }).then(resultArray =>{
        return resultArray.filter(result => result != undefined)
      // return one result
      }).then( flatArray =>{
        return flatArray[0];
      })
    })
  }

  getLesson(lessonId){

    return this.dbPromise.then( db =>{
      let tx = db.transaction([DBHelper.LESSON_STORE_NAME, DBHelper.OFFLINE_LESSON_STORE_NAME]);
      let lessonStore = tx.objectStore(DBHelper.LESSON_STORE_NAME);
      let offlineLessonStore = tx.objectStore(DBHelper.OFFLINE_LESSON_STORE_NAME)

      // get from network and offline sources
      return Promise.all([
        lessonStore.get(lessonId),
        offlineLessonStore.index('by-lesson-id').get(lessonId)
      ])
      // flatten the results
      .then( resultArray => resultArray.flat())
      // get rid of undefined results
      .then( results => results.filter(result => result != undefined ))
      // return one result
      .then( results => results[0])
    })
  }

  getLessons(classId){

    return this.dbPromise.then( db =>{
      let tx = db.transaction([DBHelper.LESSON_STORE_NAME, DBHelper.OFFLINE_LESSON_STORE_NAME]);
      let lessonStore = tx.objectStore(DBHelper.LESSON_STORE_NAME);
      let offlineLessonStore = tx.objectStore(DBHelper.OFFLINE_LESSON_STORE_NAME);
      
      // get all the lessons (network and offline) attached to givenClass
      return Promise.all([
        lessonStore.index('by-class').getAll(classId),
        offlineLessonStore.index('by-attached-class-id').getAll(classId)
      ])
      // flatten the results
      .then( resultArray => resultArray.flat())
      // remove undefined results
      .then( lessonObjects => lessonObjects.filter( lessonObject => lessonObject != undefined))
    })
  }

  getClasses(){

    return this.dbPromise.then((db)=>{
      let tx = db.transaction([DBHelper.CLASS_STORE_NAME, DBHelper.OFFLINE_CLASS_STORE_NAME]);
      let classStore = tx.objectStore(DBHelper.CLASS_STORE_NAME);
      let offlineClassStore = tx.objectStore(DBHelper.OFFLINE_CLASS_STORE_NAME)
      
      // get all the classes
      return Promise.all([
        classStore.getAll(),
        offlineClassStore.getAll()
      ])
      // flatten the results array
      .then( resultsArray => resultsArray.flat())
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

  // OFFLINE RESOURCES - ADD
  addOfflineClass({
    className = DBHelper.OFFLINE_CLASS_MODEL.className,
    attachedStudents = DBHelper.OFFLINE_CLASS_MODEL.attachedStudents
  }){
    this.addOfflineRecord(DBHelper.OFFLINE_CLASS_STORE_NAME, {className, attachedStudents}, "classId")
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

  // OFFLINE RESOURCES GET
  getOfflineClasses(){
    return this.dbPromise.then( db =>{
      let tx = db.transaction(DBHelper.OFFLINE_CLASS_STORE_NAME)
      let classStore = tx.objectStore(DBHelper.OFFLINE_CLASS_STORE_NAME)
      return classStore.getAll()
    })
  }

  getOfflineLessonsByClass(offlineClassId){
    return this.dbPromise.then( db =>{
      let tx = db.transaction(DBHelper.OFFLINE_LESSON_STORE_NAME);
      let lessonStore = tx.objectStore(DBHelper.OFFLINE_LESSON_STORE_NAME)

      return lessonStore.index('by-attached-class-id').getAll(offlineClassId);
    })
  }

  // OFFLINE RESOURCES MODIFY
  modifyOfflineClass({
    classId = undefined,
    className = undefined,
    attachedStudents = undefined
  }){

    return this.dbPromise.then( db =>{

      // check if we have a valid classId
      if(classId == undefined) throw new Error(`Cannot modify class without classId`)

      let tx = db.transaction(DBHelper.OFFLINE_CLASS_STORE_NAME, 'readwrite');
      let classStore = tx.objectStore(DBHelper.OFFLINE_CLASS_STORE_NAME);

      return classStore.index('by-class-id').openCursor(classId,'next')
      .then( cursor =>{
        // if there is nothing in the cursor
        if(!cursor) throw new Error(`No record found for classId:${classId}`)

        let updatedClass = {
          classId: cursor.value['classId'],
          className: (className) ? className : cursor.value['className'],
          attachedStudents: (attachedStudents) ? attachedStudents : cursor.value['attachedStudents']
        }

        return cursor.update(updatedClass)
      })
    })
  }

  modifyOfflineLesson({
    lessonId = undefined,
    lessonName = undefined,
    lessonDate = undefined,
    attachedStudents = undefined,
    attachedClass = undefined
  }){
    return this.dbPromise.then( db =>{
      //check that we have a lessonId
      if(lessonId == undefined) throw new Error(`Cannot modify lesson without lessonId`)

      let tx = db.transaction(DBHelper.OFFLINE_LESSON_STORE_NAME, 'readwrite');
      let lessonStore = tx.objectStore(DBHelper.OFFLINE_LESSON_STORE_NAME);

      return lessonStore.index('by-lesson-id').openCursor(lessonId, 'next')
      .then( cursor =>{
        if (!cursor) throw new Error(`No record found for lessonId: ${lessonId}`)

        let updatedLesson = {
          lessonId: cursor.value['lessonId'],
          lessonName: (lessonName) ? lessonName : cursor.value['lessonName'],
          lessonDate: (lessonDate) ? new Date(lessonDate) : cursor.value['lessonDate'],
          attachedStudents: (attachedStudents) ? attachedStudents : cursor.value['attachedStudents'],
          attachedClass: (attachedClass) ? attachedClass : cursor.value['attachedClass']
        }

        return cursor.update(updatedLesson)
      })
    })
  }

  modifyOfflineStudent({
    studentId = undefined,
    studentName = undefined
  }){

    return this.dbPromise.then( db =>{
      if( studentId == undefined ) throw new Error('Cannot modify student without studentId');

      let tx = db.transaction(DBHelper.OFFLINE_STUDENT_STORE_NAME, 'readwrite');
      let studentStore = tx.objectStore(DBHelper.OFFLINE_STUDENT_STORE_NAME);

      return studentStore.index('by-student-id').openCursor(studentId, "next")
      .then( cursor =>{
        if( cursor == undefined ) throw new Error(`No record found for studentId ${studentId}`);

        let updatedStudent = {
          studentId: cursor.value['studentId'],
          studentName : (studentName) ? studentName : cursor.value['studentName']
        }

        return cursor.update(updatedStudent);
      })
    })
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

  populateOfflineDatabase(){
    this.addOfflineClass({className:"Test Class 1", attachedStudents:['2','#1'] });
    this.addOfflineClass({className:"Test Class 2", attachedStudents:['1','2','3'] });

    this.addOfflineLesson({lessonName:"Test lesson 1", attachedClass:'#1', attachedStudents:['2','#1'] });
    this.addOfflineLesson({lessonName:"Test lesson 1", attachedClass:1, attachedStudents:['1','2','3'] });

    this.addOfflineStudent({studentName:"Test Student1"});
    this.addOfflineStudent({studentName:"Test Student2"});

  }
}