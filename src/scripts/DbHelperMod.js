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

  getClass({
    classId = undefined,
    className = undefined,
    attachedStudents = undefined
  }){
    return this.getClasses(arguments[0]).then( responseArray => responseArray[0])
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
  getLesson({
    lessonId = undefined,
    attachedClass = undefined,
    attachedStudents = undefined,
    date = undefined,
    name = undefined
  }={}){
    return this.getLessons(arguments[0]).then( responseArray => responseArray[0])
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

  getStudent({
    studentId = undefined,
    name = undefined
  }={}){
    return this.getStudents(arguments[0]).then( responseArray => responseArray[0])
  }

  getClips({
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

  getCompleteInfo({
    classId = undefined,
    lessonId = undefined,
    studentIds = undefined
  }={}){// get information of objects linked to clip (e.g. associated class/lesson/student)

    // exit if not given al the points
    if(classId == undefined || lessonId == undefined || studentIds == undefined){
      throw new Error(`Complete info not provided | Class:${classId}, lesson:${lessonId}, student:${studentIds}`)
    }

    let studentPromises = studentIds.map( studentId =>
      this.getStudents({ studentId })
      .then( studentArray => studentArray[0] ) 
    );

    return Promise.all([
      this.getClasses({ classId }),
      this.getLessons({ lessonId }),
      Promise.all( studentPromises )
    ])
    .then( infoObjects=>{
      return {
        class:infoObjects[0][0],
        lesson:infoObjects[1][0],
        students:infoObjects[2] // does this pass the right value?
      }
    })
  }

  getNames({
    classId = undefined,
    lessonId = undefined,
    attachedStudents = []
  }={}){ // get class/lesson/student names for filter list display
    
    let studentPromises = attachedStudents.map( studentId => this.getStudents({ studentId }))

    return Promise.all([
      this.getClasses({ classId }),
      this.getLessons({ lessonId }),
      Promise.all( studentPromises )
    ]).then( responses =>{
      return {
        className: ( classId != undefined && responses[0] ) ? responses[0][0].className : undefined,
        lessonName: ( lessonId != undefined && responses[1] ) ? responses[1][0].lessonName : undefined,
        studentNames: ( attachedStudents[0] != undefined && responses[2] ) ? responses[2][0].map( studentObject => studentObject.studentName ) : undefined
      }
    })
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
    attachedStudents,
    audioData
  }={}){
    this.clientDataHelper.addClip({attachedClass, attachedLesson, attachedStudents, audioData})
  }


  modifyClass({
    classId = undefined,
    className = undefined,
    attachedStudents = undefined
  }){
    // check if we need to do for client or server

    // assume that all modification at this point is client?
    return clientDataHelper.modifyClass(arguments[0])
  }

  modifyLesson({
    lessonId = undefined,
    attachedClass = undefined,
    attachedStudents = undefined,
    lessonDate = undefined,
    lessonName = undefined
  }={}){
    return clientDataHelper.modifyLesson(arguments[0])
  }

  modifyStudent({
    studentId = undefined,
    studentName = undefined
  }={}){
    return clientDataHelper.modifyStudent(arguments[0])
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
