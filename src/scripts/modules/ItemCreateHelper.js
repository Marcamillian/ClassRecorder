export default class ItemCreateHelper{
  constructor(){

  }

  static generateClassForm({
    studentOptions= [],
    existingClassObject= {},
    submitCallback = console.log
  }={}){
    const form = document.createElement('form');
    const submitButton = document.createElement('button');

    form.addEventListener('submit',(event)=>{
      event.preventDefault();

      
      const completeForm = event.target;

      const className = completeForm.elements["create-class-name"].value;
      var attachedStudents = completeForm.querySelectorAll('.create-class-students:checked')
      
      attachedStudents = [...attachedStudents].map(selectElement =>selectElement.value);

      // TODO: Form validation 
      submitCallback({className, attachedStudents});
    })

    // class name
    ItemCreateHelper.generateTextEntry({
      optionId:"create-class-name" ,
      labelText:"Class Name",
      existingInput: existingClassObject.className})
    .forEach(element =>{
      form.appendChild(element)
    });

    // attached students
    form.appendChild(this.generateListMultiSelect({
      listId: "create-class-students",
      selectOptions: studentOptions,
      listLabelText: "Attached Students",
      existingSelection: existingClassObject.attachedStudents
    }))

    
    submitButton.type = 'submit';
    submitButton.innerText = "Create Class";
    form.appendChild(submitButton);

    return form;
  }


  static generateLessonForm({
    classOptions = [],
    submitCallback = console.log
  }={}){

    const form = document.createElement('form');
    const submitButton = document.createElement('button')

    form.addEventListener('submit',(event)=>{
      event.preventDefault();
      const completeForm = event.target;

      const lessonName = completeForm['create-lesson-name'].value;
      const lessonDate = completeForm['create-lesson-date'].value;
      const attachedClass = completeForm['create-lesson-class'].value;

      //TODO: Form validation

      submitCallback({lessonName, lessonDate, attachedClass})
    });

    // lesson name
    ItemCreateHelper.generateTextEntry({optionId: 'create-lesson-name', labelText:"Lesson Name"}).forEach(element=>{
      form.appendChild(element);
    });

    // lesson date
    ItemCreateHelper.generateDateInput({dateId: 'create-lesson-date', labelText:"Lesson Date"}).forEach( element =>{
      form.appendChild(element);
    });

    // attached class
    ItemCreateHelper.generateListSingleSelect({
      labelText: "Attached Class",
      listId: 'create-lesson-class',
      listOptions:classOptions
    }).forEach(element => form.appendChild(element));

    submitButton.type = 'submit';
    submitButton.innerText = "Create Lesson";
    form.appendChild(submitButton);

    return form;
  }

  static generateStudentForm({
    submitCallback = console.log
  }={}){
    const form = document.createElement('form');
    const submitButton = document.createElement('button')

    form.addEventListener('submit', (event)=>{
      event.preventDefault();

      const completeForm = event.target;

      const studentName = completeForm['create-student-name'].value;

      // TODO: Form validation
      submitCallback({studentName})
    })

    ItemCreateHelper.generateTextEntry({
      optionId:'create-student-name',
      labelText:"Student Name"
    }).forEach( element =>{
      form.appendChild(element)
    })

    
    submitButton.type = 'submit';
    submitButton.innerText = "Create Student";
    form.appendChild(submitButton);

    return form;
  }


  static generateTextEntry({
    optionId = undefined,
    labelText = "Some option",
    existingInput = undefined
  }={}){
    const label = document.createElement('label');
    label.innerText = labelText;
    label.setAttribute('for', optionId);

    const input = document.createElement('input');
    input.type = "text";
    input.id = optionId;
    input.name = optionId;
    input.innerText = existingInput || "";
    input.value = input.innerText;

    return [label, input]
  }

  static generateDateInput({
    dateId = undefined,
    labelText = "Some Date",
    existingInput = undefined
  }){

    const label = document.createElement('label')
    const dateInput = document.createElement('input');

    label.innerText = labelText;
    label.setAttribute('for', dateId);

    dateInput.type = 'date';
    dateInput.id = dateId;
    dateInput.name = dateId;
    dateInput.innerText = existingInput | "";


    return [label, dateInput]
  }

  static generateListMultiSelect({
    listId,
    listLabelText = "Some List",
    selectOptions = [],
    existingSelection = []
  }){
    const fieldSet = document.createElement('fieldset');
    fieldSet.classList.add('option-div','active');


    // label the while list section
    const listLabel = document.createElement('legend');
    listLabel.innerText = listLabelText;
    fieldSet.appendChild(listLabel)

    // generate the checkboxes for each option
    selectOptions.forEach( ({ id, labelText }) =>{
      const elementLabel = document.createElement('label');
      const option = document.createElement('input');
      
      const elementId = `${listId}-${id}`;

      option.id = elementId;
      option.classList.add(listId);
      option.type = 'checkbox';
      option.value = id;
      option.name = listId;
      // if the studentId is already selected
      if(existingSelection.includes(id)) option.checked = true;
      
      elementLabel.setAttribute('for', elementId);
      elementLabel.innerText = labelText;

      fieldSet.appendChild(option);
      fieldSet.appendChild(elementLabel);
    })

    return fieldSet;
  }

  static generateListSingleSelect({
    labelText = "Some Dropdown",
    listId = undefined,
    listOptions = []
  }={}){

    const listLabel = document.createElement("label");
    listLabel.innerText = labelText;
    listLabel.setAttribute('for', listId)

    const listContainer = document.createElement('select');
    listContainer.id = listId;
    listContainer.name = listId;

    listOptions.forEach( ({id, labelText}) =>{
      const optionElement = document.createElement('option')
      optionElement.innerText = labelText;
      optionElement.value = id;

      listContainer.appendChild(optionElement)
    })
    
    return [listLabel, listContainer]

  }

  static prefillForm({
    generatedForm,
    classObject,
    lessonObject,
    studentObject
  }){
    if(classObject){
      // enter the clasName
      var classNameInput = generatedForm.querySelector('input[name=create-class-name]')
      classNameInput.value = classObject.className || "";
      classNameInput.innerText = classObject.className || "";

      // check the attachedStudents

      // get the form elements of 
      var studentElements = [...generatedForm.getElementsByClassName('create-class-students')];
      var studentValues = studentElements.map(studentEl => studentEl.value);

      classObject.attachedStudents.forEach( studentId =>{

        const elementIndex = studentValues.indexOf(studentId);

        if(elementIndex != -1){
          studentElements[elementIndex].checked = true;
        }
      })

      return generatedForm;

    }else if(lessonObject){
      var lessonNameInput = generatedForm.querySelector('[name=create-lesson-name]');
      lessonNameInput.value = lessonObject.lessonName || "";
      lessonNameInput.innerText = lessonObject.lessonName || "";

      var lessonDateInput = generatedForm.querySelector('[name=create-lesson-date]');
      if(lessonObject.lessonDate){
        let dateObject = new Date(lessonObject.lessonDate);
        let dateString = dateObject.toISOString().split("T")[0];
        lessonDateInput.value = dateString;
        lessonDateInput.innerText =  dateString;
      }

      var attachedClassInput = generatedForm.querySelector('[name=create-lesson-class]');
      attachedClassInput.value = lessonObject.attachedClass || "";

      
    }else if(studentObject){
      var studentNameInput = generatedForm.querySelector('[name=create-student-name]');
      studentNameInput.value = studentObject.studentName || "";
      studentNameInput.innerText = studentObject.studentName || "";
    }

    return generatedForm
  }

  static generateModifyItemSelect({
    labelText = "Some list",
    listId = unedfined,
    itemObjects,
    modifyItemSelectCallback = console.log
  }){
    var modifyCallback = (event)=>{
      let itemId = event.target.value;

      modifyItemSelectCallback({itemId})
    }

    var listElements = ItemCreateHelper.generateListSingleSelect({
      labelText,
      listId
    })

    listElements.forEach( listElement =>{
      listElement.addEventListener('click', modifyCallback);
    })

    // add callback to the checkbox items

    // return the select element
    return listElements;
  }

  
}