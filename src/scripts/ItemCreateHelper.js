'use strict';

class ItemCreateHelper{
  constructor(){

  }

  static generateClassForm({
    studentOptions= []
  }={}){
    const form = document.createElement('form');

    // TODO: set the onsubimt callback
    form.addEventListener('submit',(event)=>{
      console.log("trying to submit");
      event.preventDefault();
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

    return form;
  }


  static generateLessonForm({
    classOptions = []
  }={}){

    const form = document.createElement('form');

    // TODO: set the onsubimt callback
    form.addEventListener('submit',(event)=>{
      console.log('use this to addOfflineLesson');
      event.preventDefault()
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

    // attached students ??

    return form;
  }

  static generateStudentForm(){
    const form = document.createElement('form');

    // TODO: set the onsubimt callback
    form.addEventListener('submit', (event)=>{
      console.log("use this for add OfflineStudent")
      event.preventDefault();
    })

    ItemCreateHelper.generateTextEntry({
      optionId:'create-student-name',
      labelText:"Student Name"
    }).forEach( element =>{
      form.appendChild(element)
    })

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
    dateInput.setAttribute('id',dateId);

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
    listContainer.setAttribute('id',listId);

    listOptions.forEach( ({id, labelText}) =>{
      const optionElement = document.createElement('option')
      optionElement.innerText = labelText;
      optionElement.value = id;

      listContainer.appendChild(optionElement)
    })
    
    return [listLabel, listContainer]

  }

  
}