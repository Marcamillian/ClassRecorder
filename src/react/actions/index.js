import DbHelper from '../modules/DbHelper';
import RecordHelper from '../modules/RecordHelper';


export const TEST_ACTION = 'test_action';

export const SET_RECORD_TAG_OPTIONS = 'set_record_tag_options';
export const SET_RECORD_SELECTED_TAGS = 'set_record_selected_tags';

export const CREATE_RECORDER = 'create-recorder';
export const REMOVE_RECORDER = 'remove-recorder';
export const STORE_AUDIO_CHUNK = 'store-audio-chunk';
export const CLEAR_AUDIO_CHUNKS = 'clear-audio-chunks';

export const SET_FILTER_OPTIONS = 'set_filter_options';
export const SET_FILTER_SELECTED = 'set_filter_selected';

export const SET_CLIPS_SELECTED = 'set_clips_selected';

const dbHelper = new DbHelper();

export function testAction(value){
  return{
    type: TEST_ACTION,
    payload: {data: value}
  }
}

// == RECORD ACTIONS

// tag actions

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

// recording actions

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

export function storeAudioChunk(audioChunk){
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


// == LISTEN ACTIONS

// filter actions

export function setFilterOption({
  classId = undefined,
  lessonId = undefined
}={}){
  let optionPromises = [];

  // get the classes
  optionPromises.push( dbHelper.getClasses() )
  // get lessons if needed
  if( classId != undefined ){ optionPromises.push( dbHelper.getLessons({ attachedClass: classId })) }
  // get students if needed
  if( lessonId != undefined ){ 
    let studentPromises = dbHelper.getClass({ classId })
    .then( classObject =>{
      let studentPromises = classObject.attachedStudents.map( studentId =>{
        return dbHelper.getStudent({ studentId })
      })
      return Promise.all( studentPromises )
    })
    optionPromises.push( studentPromises )
  }

  // wait for all of the options to return
  let tagOptions = Promise.all( optionPromises )
  .then( ([ classOptions, lessonOptions, studentOptions ]) =>{
    return { data: {classOptions, lessonOptions, studentOptions }}
  })
  .catch( error =>{
    console.error( "couldn't get filter options")
  })

  return{
    type: SET_FILTER_OPTIONS,
    payload: tagOptions
  }

}

export function setFilterSelected({
  classId = undefined,
  lessonId = undefined,
  studentId = undefined
}={}){
  return{
    type: SET_FILTER_SELECTED,
    payload: {data: {classId, lessonId, studentId}}
  }
}

export function setClipsSelected({
  classId = undefined,
  lessonId = undefined,
  studentId = undefined
}={}){
  let clipPromise = dbHelper.getClips({classId, lessonId, studentId})
  // TODO: Get strings for the clip attached stuff
  .then( clips =>{
    return {data : clips}
  })
  .catch( error =>{
    console.error("Couldn't get clips")
  })

  return{
    type: SET_CLIPS_SELECTED,
    payload: clipPromise
  }
}