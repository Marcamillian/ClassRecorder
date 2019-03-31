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
    classId = undefined,
    className = undefined,
    attachedStudents = undefined
  }={}){
    return Promise.all([
      this.serverDataHelper.getClasses(arguments[0]),
      this.clientDataHelper.getClasses(arguments[0])
    ])
    .then( resultsArray => resultsArray.flat()) // merge the array of results together
    .then ( studentObjects => studentObjects.filter( studentObject => studentObject != undefined)) // remove undefined students
  }
  
  getLessons({
    lessonId = undefined,
    attachedClass = undefined,
    attachedStudents = undefined,
    date = undefined,
    name = undefined
  }={}){
    return Promise.all([
      this.serverDataHelper.getLessons(arguments[0]),
      this.clientDataHelper.getLessons(arguments[0])
    ])
    .then( resultsArray => resultsArray.flat()) // merge the array of results together
    .then ( studentObjects => studentObjects.filter( studentObject => studentObject != undefined)) // remove undefined students
  }

  getStudents({
    studentId = undefined,
    name = undefined
  }={}){
    return Promise.all([
      this.serverDataHelper.getStudents(arguments[0]),
      this.clientDataHelper.getStudents(arguments[0])
    ])
    .then( resultsArray => resultsArray.flat()) // merge the array of results together
    .then ( studentObjects => studentObjects.filter( studentObject => studentObject != undefined)) // remove undefined students
  }

  getClip({
    classId = undefined,
    lessonId = undefined,
    studentId = undefined
  }){
    return Promise.all([
      this.serverDataHelper.getClips(arguments[0]),
      this.clientDataHelper.getClips(arguments[0])
    ])
    .then( resultsArray => resultsArray.flat()) // merge the array of results together
    .then ( studentObjects => studentObjects.filter( studentObject => studentObject != undefined)) // remove undefined students
  }

  // !!TODO : rewrite this  
  getCompleteInfo({
    classId = undefined,
    lessonId = undefined,
    studentId = undefined
  }={}){ // get information of objects linked to clip (e.g. className from classId)
    
  }

  getNames(){ // get class/lesson/student names for filter list display

  }

  // put methods (create)

  addClass({
    className,
    attachedStudents
  }={}){
    /* // DECIDE WHICH MODULE TO USE if we can hit server with a request
    if(navigator.onLine){
      console.log("do online class")
    }else{
      console.log("do offline class")
    }
    */
    this.clientDataHelper.addClass({className, attachedStudents})
  }

  addLesson({
    lessonName,
    lessonDate = Date.now(),
    attachedClass,
    attachedStudents
  }={}){
    this.clientDataHelper.addLesson({lessonName, lessonDate, attachedClass, attachedStudents})
  }

  addStudent({
    studentName
  }){
    this.clientDataHelper.addStudent({studentName})
  }

  addClip({
    attachedClass,
    attachedLesson,
    attachedStudent,
    audioData
  }={}){
    this.clientDataHelper.addClip({attachedClass, attachedLesson, attachedStudents, audioData})
  }


  // post methods (udpate) post TO somewhere

  // populate functions

  uploadLocals(){

  }

  populateFromSource(){
    this.serverDataHelper.populateDatabase(DbHelperMod.DATA_URL);
    this.clientDataHelper.populateTestData();
  }
}
