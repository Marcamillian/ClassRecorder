'use strict';

class ItemCreateHelper{
  constructor(){

  }

  static generateClassForm({
    studentOptions= []
  }={}){
    const form = document.createElement('form');
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


  generateLessonForm({
    classObjects = []
  }={}){

    const from = document.createElement('form');

    form.addEventListener('submit',(event)=>{
      console.log('use this to addOfflineLesson');
      event.preventDefault()
    })

    // lesson name
    ItemCreateHelper.generateTextEntry({optionId: 'create-lesson-name', labelText:"Lesson Name"}).forEach(element=>{
      form.appendChild(element);
    })

    // attached class
    generateListSingleSelect()

    // attached students



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

  static generateListSingleSelect({}){

  }
}