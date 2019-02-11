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
    this.offlineHelper = new DbHelperOffline;
    this.onlineHelper = new DbHelperOnline;
    
    this.dbPromise = idb.openDb( DbHelperMod.DATABASE_NAME , 1,(upgradeDb)=>{
      this.offlineHelper.storeInit(upgradeDb);
      this.onlineHelper.storeInit(upgradeDb);
    })

    this.onlineHelper.dbPromiseInit(this.dbPromise)
    this.offlineHelper.dbPromiseInit(this.dbPromise)
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

  getClip({
    classId = undefined,
    lessonId = undefined,
    studentId = undefined
  }){

  }

  getClasses(options){

  }

  getLessons(options){

  }

  getStudents(){

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
