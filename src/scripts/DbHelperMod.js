import { DbHelperOffline } from './modules/DbHelper_Offline.js'
import { DbHelperOnline } from './modules/DbHelper_Online.js'

export default class DbHelperMod {

  static get DATABASE_NAME(){
    return 'recorder-db'
  }

  static get DATA_URL(){
    const PORT = 3000;
    return `/data/appData.json`;
  }

  // constructor
  constructor(){
    this.offlineHelper = new DbHelperOffline(DbHelperMod.DATABASE_NAME);
    this.onlineHelper = new DbHelperOnline(DbHelperMod.DATABASE_NAME);
    
    this.dbPromise = idb.openDb( DbHelperMod.DATABASE_NAME , 1,(upgradeDb)=>{
      this.offlineHelper.storeInit(upgradeDb);
      this.onlineHelper.storeInit(upgradeDb);
    })

    this.onlineHelper.dbPromiseInit(this.dbPromise)
    this.offlineHelper.dbPromiseInit(this.dbPromise)
  }


  // get methods
  getClasses({
    id = undefined,
    className = undefined,
    attachedStudents = undefined
  }){
    return this.onlineHelper.getClasses(arguments[0])
  }
  
  getLessons({
    id = undefined,
    attachedClass = undefined,
    attachedStudents = undefined,
    date = undefined,
    name = undefined
  }){
    return this.onlineHelper.getLessons(arguments[0])
  }

  getStudents({
    id = undefined,
    name = undefined
  }){
    return this.onlineHelper.getStudents(arguments[0])
  }

  getClip({
    classId = undefined,
    lessonId = undefined,
    studentId = undefined
  }){

  }

  // put methods (create)
  addDBRecord(){

  }

  addClass(){

  }

  addLesson(){

  }

  addStudent(){

  }


  // post methods (udpate) post TO somewhere

  // populate functions

  uploadLocals(){

  }

  populateFromSource(){
    this.onlineHelper.populateDatabase(DbHelperMod.DATA_URL)
  }
}
