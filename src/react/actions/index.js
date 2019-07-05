import DbHelper from '../modules/DbHelper';
import RecordHelper from '../modules/RecordHelper';


export const TEST_ACTION = 'test_action';
export const SET_RECORD_TAG_OPTIONS = 'set_record_tag_options';
export const SET_RECORD_SELECTED_TAGS = 'set_record_selected_tags';
export const CREATE_RECORDER = 'create-recorder';
export const REMOVE_RECORDER = 'remove-recorder';
export const STORE_AUDIO_CHUNK = 'store-audio-chunk';
export const CLEAR_AUDIO_CHUNKS = 'clear-audio-chunks';


const dbHelper = new DbHelper();

export function testAction(value){
  return{
    type: TEST_ACTION,
    payload: {data: value}
  }
}

export function setRecordTagOptions({
  classId = undefined,
  lessonId = undefined,
}={}){
  let optionPromises = []
  
  // fetch options from dbHelper
  optionPromises.push( dbHelper.getClasses() )
  if ( classId != undefined ){ optionPromises.push( dbHelper.getLessons({ attachedClass: classId }) ) }
  if ( lessonId != undefined) {
    let studentPromises = dbHelper.getClass({ classId })
    .then( classObject =>{
      let studentPromises = classObject.attachedStudents.map( studentId =>{
        return dbHelper.getStudent({ studentId })
      })
      return Promise.all(studentPromises)
    })
    
    optionPromises.push( studentPromises )
  }

  // get all the options in a promise
  let tagOptions = Promise.all( optionPromises )
  .then(  ([ classOptions, lessonOptions, studentOptions ]) => {
    return { data: {classOptions, lessonOptions, studentOptions} }
  })
  .catch( error =>{
    console.error( "couldn't get tag options")
  }) 

  return{
    type: SET_RECORD_TAG_OPTIONS,
    payload: tagOptions
  }

}

export function setRecordSelectedTags({
  classId = undefined,
  lessonId = undefined,
  studentIds = []
}={}){

  return{
    type: SET_RECORD_SELECTED_TAGS,
    payload: {data: {classId, lessonId, studentIds}}
  }
}

export function createRecorder({ storeAudioCallback }){

  let recorderPromise = RecordHelper.createRecorder(storeAudioCallback)
  .then( recorder =>{
    recorder.start()
    return {data: recorder}
  })

  return{
    type: CREATE_RECORDER,
    payload: recorderPromise
  }

}

export function removeRecorder(){
  return{
    type: REMOVE_RECORDER,
    payload: {data: { recorder: undefined}}
  }
}


// TODO - does this make it back to the actions?
export function storeAudioChunk(audioChunk){
  console.log("Storing a chunk")
  return{
    type: STORE_AUDIO_CHUNK,
    payload: {data: { audioChunk }}
  }
}

export function saveAudioClip({ audioChunks, attachedClass, attachedLesson, attachedStudents }){
  let audioData = new Blob(audioChunks, {'type':'audio/ogg; codecs=opus'})

  dbHelper.addClip({ attachedClass, attachedLesson, attachedStudents, audioData })

  return{
    type:CLEAR_AUDIO_CHUNKS,
    payload: {data: undefined}
  }
}