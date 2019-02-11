export { DbHelperOffline }

class DbHelperOffline{

  static get STORE_NAMES(){
    return {
      class: 'offline-class-store',
      lesson: 'offline-lesson-store',
      student: 'offline-student-store'
    }
  }

  // constructor
  constructor( dbName ){
    this.dbPromise = undefined;
  }

  storeInit(upgradeDb){
    switch(upgradeDb.oldVersion){
      case 0:

        var classStore = upgradeDb.createObjectStore( DbHelperOffline.STORE_NAMES.class, {autoIncrement: true} )
        classStore.createIndex('by-name', 'className');
        classStore.createIndex('by-class-id', 'classId');

        
        var lessonStore = upgradeDb.createObjectStore( DbHelperOffline.STORE_NAMES.lesson, {autoIncrement: true})
        lessonStore.createIndex('by-date', 'lessonDate')
        lessonStore.createIndex('by-name', 'className')
        lessonStore.createIndex('by-lesson-id', 'lessonId')
        lessonStore.createIndex('by-attached-class-id','attachedClass')

        var studentStore = upgradeDb.createObjectStore( DbHelperOffline.STORE_NAMES.student, {autoIncrement: true})
        studentStore.createIndex('by-name','studentName');
        studentStore.createIndex('by-student-id', 'studentId')
        
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
  addRecord(dbPromise, storeName, recordObject){
    return dbPromise.then((db)=>{
      let tx = db.transaction(storeName, 'readwrite');
      let objectStore = tx.objectStore(storeName);

      objectStore.put(recordObject);
      return tx.complete;
    })
  }

  addClass(){

  }

  addLesson(){

  }

  addStudent(){

  }

}