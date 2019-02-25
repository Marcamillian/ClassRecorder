import { ClientDataHelper } from './modules/ClientDataHelper.js'
import { ServerDataHelper } from './modules/ServerDataHelper.js'

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
    this.clientDataHelper = new ClientDataHelper(DbHelperMod.DATABASE_NAME);
    this.serverDataHelper = new ServerDataHelper(DbHelperMod.DATABASE_NAME);
    
    this.dbPromise = idb.openDb( DbHelperMod.DATABASE_NAME , 1,(upgradeDb)=>{
      this.clientDataHelper.storeInit(upgradeDb);
      this.serverDataHelper.storeInit(upgradeDb);
    })

    this.clientDataHelper.dbPromiseInit(this.dbPromise)
    this.serverDataHelper.dbPromiseInit(this.dbPromise)
  }


  // get methods
  getClasses({
    id = undefined,
    className = undefined,
    attachedStudents = undefined
  }){
    return this.serverDataHelper.getClasses(arguments[0])
  }
  
  getLessons({
    id = undefined,
    attachedClass = undefined,
    attachedStudents = undefined,
    date = undefined,
    name = undefined
  }){
    return this.serverDataHelper.getLessons(arguments[0])
  }

  getStudents({
    id = undefined,
    name = undefined
  }){
    return this.serverDataHelper.getStudents(arguments[0])
  }

  getClip({
    classId = undefined,
    lessonId = undefined,
    studentId = undefined
  }){

  }

  getCompleteInfo(){ // get information of objects linked to clip (e.g. className from classId)

  }

  getNames(){ // get class/lesson/student names for filter list display

  }

  // put methods (create)

  addClass(){
    /* // DECIDE WHICH MODULE TO USE if we can hit server with a request
    if(navigator.onLine){
      console.log("do online class")
    }else{
      console.log("do offline class")
    }
    */


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
    this.serverDataHelper.populateDatabase(DbHelperMod.DATA_URL)
  }
}
