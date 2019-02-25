
export const modelClass = {
  classId: undefined,
  className: undefined,
  attachedStudents: []
}

export const modelLesson = {
  lessonId: undefined,
  attachedClass: undefined,
  attachedStudents: [],
  lessonDate: undefined,
  lessonName: 'unnamed lesson'
}

export const modelStudent = {
  studentId: undefined,
  studentName: undefined,
}

export const modelClip = {
  clipId: undefined,
  attachedLesson: undefined,
  attachedStudents: [],
  audioData: undefined
} 

export default {modelClass, modelLesson, modelStudent, modelClip}