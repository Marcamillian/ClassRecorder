import DbHelper from '../modules/DbHelper';

export const TEST_ACTION = 'test_action';
export const SET_RECORD_TAG_OPTIONS = 'set_record_tag_options';

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
  if ( lessonId != undefined) { optionPromises.push( dbHelper.getStudents({ attachedLesson: lessonId }) ) }

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
