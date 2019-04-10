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

  static get STORE_INDEXES(){
    return{
      class: 'by-class-id',
      lesson: 'by-lesson-id',
      student: 'by-student-id'
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

  static maskId(index){
    return `#${index}`
  }

  static revealId(maskedIndex){
    return Number(maskedIndex.replace(/#/g, ""));
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
        if( searchFunction(recordObject) ) results.push(recordObject)

        // continue the search
        return cursor.continue().then( searchRecord )
      })

      return tx.complete.then( () => results )
    })
  }
  
  getClasses({
    classId = undefined,
    className = undefined,
    attachedStudents = undefined
  }={}){

    let storeName = ClientDataHelper.STORE_NAMES.class;

    if( classId == undefined && className == undefined && attachedStudents == undefined ){
      return this.getAllRecords(storeName)
    }

    // if attributes stated - create a function to determine 
    function classSearch(classObject){
      return(
        (classId == undefined || classId == classObject.classId)
        && (className == undefined || className == classObject.className )
        && (attachedStudents == undefined || ClientDataHelper.hasMember( attachedStudents, classObject.attachedStudents))
      )
    }

    return this.searchRecords( storeName, classSearch)
  }
  
  getLessons({
    lessonId = undefined,
    lessonName = undefined,
    attachedClass = undefined,
    attachedStudents = undefined
  }={}){

    let storeName = ClientDataHelper.STORE_NAMES.lesson;

    if( lessonId == undefined && lessonName == undefined && attachedClass == undefined && attachedStudents == undefined  ){
      return this.getAllRecords(storeName)
    }

    function lessonSearch(lessonObject){
      return(
        (lessonId == undefined || lessonId == lessonObject.lessonId)
        && (lessonName == undefined || lessonName == lessonObject.lessonName)
        && (attachedClass == undefined || attachedClass == lessonObject.attachedClass)
        && (attachedStudents == undefined || ClientDataHelper.hasMember(attachedStudents, lessonObject.attachedStudents))
      )
    }

    return this.searchRecords( storeName, lessonSearch)
  }

  getStudents({
    studentId = undefined,
    studentName = undefined
  }={}){

    let storeName = ClientDataHelper.STORE_NAMES.student;

    if( studentId == undefined && studentName == undefined ){
      return this.getAllRecords(storeName)
    }
    
    function studentSearch(studentObject){
      return(
        (studentId == undefined || studentId == studentObject.studentId)
        && ( studentName == undefined || studentName == studentObject.studentName)
      )
    }

    return this.searchRecords( storeName, studentSearch )

  }

  getClips({
    classId = undefined,
    lessonId = undefined,
    studentId = undefined,
  }){
    let storeName = ClientDataHelper.STORE_NAMES.clip;

    // if no attributes specified - return all
    if( classId == undefined && lessonId == undefined && studentId == undefined){
      return this.getAllRecords(storeName)
    }

    function clipSearch(clipObject){
      return(
        (classId == undefined || classId == clipObject.attachedClass)
        && (lessonId == undefined || lessonId == clipObject.attachedLesson)
        && (studentId == undefined || studentId == clipObject.studentId)
      )
    }

    return this.searchRecords( storeName, clipSearch )
  }

  // put methods (create)
  addRecord(storeName, recordObject, idLabel = "id"){
    return this.dbPromise.then((db)=>{
      let tx = db.transaction(storeName, 'readwrite');
      let objectStore = tx.objectStore(storeName);

      // add the object to the store
      objectStore.put(recordObject)
      .then( autoKey =>{ // take the key that was automatically assigned to the record
        objectStore.openCursor(autoKey) // open that record 
        .then( cursor =>{ 
          if(cursor){
            // update the record - adding a id field with a value of the autokey with a mask 
            cursor.update({...cursor.value, [idLabel]:ClientDataHelper.maskId(cursor.key)})
            cursor.continue()
          }
        })
      })
      return tx.complete;
    })
  }

  addClass({
    className = modelClass.className,
    attachedStudents = modelClass.attachedStudents
  }={}){
    attachedStudents = attachedStudents.map( studentId => studentId.toString())

    return this.addRecord(ClientDataHelper.STORE_NAMES.class, {className, attachedStudents}, "classId")
  }

  addLesson({
    attachedClass = modelLesson.attachedClass,
    attachedStudents = modelLesson.attachedStudents,
    lessonDate = modelLesson.lessonDate,
    lessonName = modelLesson.lessonName
  }={}){
    var dateMillisecond = new Date(lessonDate);
    lessonDate = dateMillisecond.valueOf();

    attachedClass = attachedClass.toString();
    attachedStudents = attachedStudents.map( studentId => studentId.toString())

    return this.addRecord(ClientDataHelper.STORE_NAMES.lesson, { attachedClass, attachedStudents, lessonDate, lessonName}, "lessonId")
  }

  addStudent({
    studentName = modelStudent.studentName
  }={}){
    return this.addRecord(ClientDataHelper.STORE_NAMES.student, {studentName}, "studentId")
  }

  addClip({
    attachedClass = modelClip.attachedClass,
    attachedLesson = modelClip.attachedLesson,
    attachedStudents = modelClip.attachedStudents,
    audioData = modelClip.audioData
  }={}){
    return this.addRecord(ClientDataHelper.STORE_NAMES.clip, {attachedClass,attachedLesson, attachedStudents, audioData}, "clipId")
  }

  modifyRecord( objectType, objectId ,recordObject){
    return this.dbPromise.then( db =>{
      let tx = db.transaction(ClientDataHelper.STORE_NAMES[ objectType ], 'readwrite');
      let objectStore = tx.objectStore(ClientDataHelper.STORE_NAMES[ objectType ])

      return objectStore.index( ClientDataHelper.STORE_INDEXES[ objectType ] ).openCursor( objectId , 'next' )
      .then( cursor =>{
        if( !cursor ) throw new Error(`No record found in store ${ClientDataHelper.STORE_NAMES[objectType]} objectId:${objectId}`)

        // !!NB - keys set to undefined in cursor.value object will overwrite  with the undefined in the record object
        return cursor.update( { ...cursor.value, ...recordObject } )
      })

    })
  }

  modifyClass({classId, className, attachedStudents}){ // NB could use rest operator to do this - better way to do this
    if (classId == undefined) throw new Error('cannot modify without classId') 

    let updateValues = {}
    if (className) updateValues['className'] = className;
    if (attachedStudents) updateValues['attachedStudents'] = attachedStudents;

    return this.modifyRecord('class', classId, updateValues)
  }

  modifyLesson({ lessonId, attachedClass, attachedStudents, lessonDate, lessonName }){
    if (lessonId == undefined) throw new Error('cannot modify without lessonId')

    let updateValues = {}
    if ( attachedClass ) updateValues['attachedClass'] = attachedClass;
    if ( attachedStudents ) updateValues['attachedStudents'] = attachedStudents;
    if ( lessonDate ) updateValues['lessonDate'] = lessonDate;
    if ( lessonName ) updateValues['lessonName'] = lessonName;
 
    return this.modifyRecord('lesson', lessonId, updateValues)
  }

  modifyStudent({ studentId, studentName }){
    if (studentId == undefined) throw new Error('cannot modify without studentId')

    let updateValues = {}
    if ( studentName ) updateValues['studentName'] = studentName;

    return this.modifyRecord( 'student', studentId, updateValues)
  }

  modifyClip({ clipId, attachedClass, attachedLesson, attachedStudents, audioData}){
    if (clipId == undefined) throw new Error('cannot modify without clipId')

    let updateValues = {}
    if ( attachedClass ) updateValues['attachedClass'] = attachedClass;
    if ( attachedLesson ) updateValues['attachedLesson'] = attachedLesson;
    if ( attachedStudents ) updateValues['attachedStudents'] = attachedStudents;
    if ( audioData ) updateValues['audioData'] = audioData;

    return modifyRecord( 'clip', clipId, updateValues )
  }

  deleteRecord( objectType , objectId ){
    return this.dbPromise.then( db =>{
      let tx = db.transaction( ClientDataHelper.STORE_NAMES[ objectType ], 'readwrite' );
      let objectStore = tx.objectStore( ClientDataHelper.STORE_NAMES[ objectType ] );

      objectStore.delete( ClientDataHelper.revealId(objectId) )
    })
  }

  deleteClass( classId ){
    return this.deleteRecord('class', classId)
  }

  deleteLesson( lessonId ){
    return this.deleteRecord('lesson', lessonId)
  }

  deleteStudent( studentId ){
    return this.deleteRecord('student', studentId)
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