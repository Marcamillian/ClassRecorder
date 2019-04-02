
export const modelClass = {
  className: undefined,
  attachedStudents: []
}

export const modelLesson = {
  attachedClass: undefined,
  attachedStudents: [],
  lessonDate: undefined,
  lessonName: 'unnamed lesson'
}

export const modelStudent = {
  studentName: undefined,
}

export const modelClip = {
  attachedClass: undefined,
  attachedLesson: undefined,
  attachedStudents: [],
  audioData: undefined
} 

export default {modelClass, modelLesson, modelStudent, modelClip}



