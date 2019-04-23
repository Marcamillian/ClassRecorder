import DbHelper from '../modules/DbHelper';

export const TEST_ACTION = 'test_action';
export const SET_RECORD_TAG_OPTIONS = 'set_record_tag_options';
export const SET_RECORD_SELECTED_TAGS = 'set_record_selected_tags';

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