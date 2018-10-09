'use strict';

class ItemCreateHelper{
  constructor(){

  }

  static generateClassForm({
    studentOptions= [],
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
    ItemCreateHelper.generateTextEntry({optionId:"create-class-name" , labelText:"Class Name"}).forEach(element =>{
      form.appendChild(element)
    });

    // attached students
    form.appendChild(this.generateListMultiSelect({
      selectOptions: studentOptions,
      listLabelText: "Attached Students",
      listId: "create-class-students"
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

    // TODO: form validation

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
    labelText = "Some option"
  }={}){
    const label = document.createElement('label');
    label.innerText = labelText;
    label.setAttribute('for', optionId);

    const input = document.createElement('input');
    input.type = "text";
    input.id = optionId;
    input.name = optionId;

    return [label, input]
  }

  static generateDateInput({
    labelText = "Some Date",
    dateId = undefined,
  }){

    const label = document.createElement('label')
    const dateInput = document.createElement('input');

    label.innerText = labelText;
    label.setAttribute('for', dateId);

    dateInput.type = 'date';
    dateInput.id = dateId;
    dateInput.name = dateId;


    return [label, dateInput]
  }

  static generateListMultiSelect({
    selectOptions = [],
    listId,
    listLabelText = "Some List"
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

  
}