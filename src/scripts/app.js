'use strict';

const updateManager = function UpdateManager(serviceWorkerPath){
  // update container
  let updateContainer = document.querySelector('.update-dialog');
  let updateButton = document.querySelector('.install-update');
  let dismissUpdate = document.querySelector('.dismiss-update');
  let myWorker;

  const updateUIShow = ()=>{
    updateContainer.classList.add('visible');
  }

  const updateUIHide = ()=>{
    updateContainer.classList.remove('visible')
  }
  
  
  myWorker = ServiceWorkerHelper(serviceWorkerPath, updateUIShow)

  updateButton.addEventListener('click', myWorker.workerSkipWaiting);
  dismissUpdate.addEventListener('click', updateUIHide)

  return { something: "Something"}
}('./sw.js');

// tutorial used - https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API
const recorderApp = function RecorderApp(){ 
  
  // ==  GET REFERENCES TO HTML ELEMENTS
  
  var recordButton = document.querySelector('button.button-record');

  var studentSelect = document.querySelector('.student-select');
  var studentSelect_studentList = document.querySelector('.sselect-page.student');
  var studentSelect_lessonList = document.querySelector('.sselect-page.lesson');
  var studentSelect_classList = document.querySelector('.sselect-page.class');
  var studentSelect_title = document.querySelector('.student-select .title');

  var recordTabBody = document.querySelector('.tab-body.record');

  var itemCreateTabBody = document.querySelector('.tab-body.item-create');
  var itemCreateTypeDropdown = document.querySelector('.tab-body.item-create .item-create-type-dropdown');
  var itemCreateOperationDropdown = document.querySelector('.tab-body.item-create .item-create-operation-dropdown');
  var itemModifyItemSelect = document.querySelector('.tab-body.item-create .item-modify-item-select');

  var playbackTabBody = document.querySelector('.tab-body.playback');
  var clipFilterContainer = document.querySelector('.clip-filter');
  var clipListDisplay = document.querySelector('.clip-list');
  let clipFilterButton = document.querySelector('.clip-filter-button');
  let filterOptionContainer = document.querySelector('.filter-option-container');
  let clipFilterTitle = document.querySelector('.clip-filter-title');

  let navTabs = document.querySelectorAll('nav li');



  // === LOAD MODULES
  
  let studentSelectModel = new StudentSelectPageModel(); // for the tagging of clips
  let clipFilterModel = new FilterModel();  // for selecting the clip filter
  let dbHelper = new DBHelper(); // for interacting with the database

  // == JS VARIABLES

  var mediaRecorder;  // stream element
  let chunks = [];  // store for segments of stream

  
  // === FUNCTION DEFINITIONS ====



  // navigation clicked
  const navTabClicked = (event)=>{
    let listItem = (event.target.nodeName == 'LI') ? event.target : event.target.parentNode;
    let tabDest = listItem.getAttribute('tab-dest');

    // remove active from all tabbodies
    document.querySelectorAll('.tab-body').forEach( tabBody => tabBody.classList.remove('active'))

    // add active to the right one
    switch(tabDest){
      case 'record': recordTabBody.classList.add('active')
      break;
      case 'playback': playbackTabBody.classList.add('active')
      break;
      case 'item-create': itemCreateTabBody.classList.add('active')
      default:
      break;
    }

  }




  // = RECORDER FUNCTIONS

  // create the media recorder object from a stream
  const createRecorder = (stream)=>{

    let recorder = new MediaRecorder(stream)

    // event listener for when each chunk is ready
    recorder.ondataavailable = (e)=>{
      chunks.push(e.data)  
    }

      // event listener when all of the data is recorded
    recorder.onstop = (e)=>{

      // combine the audio chunks into a single blob
      var blob = new Blob(chunks, {'type': 'audio/ogg; codecs=opus'});
      let tags = studentSelectModel.getSelectedOptions()

      // reset the chunks
      chunks = [];

      // store the audio clip in the database
      storeAudioClip({audioBlob: blob, classId: tags.class, lessonId: tags.lesson, studentIds: tags.student})

    }

    return recorder;
  }

  const studentSelectOptionClicked = (event)=>{

    // if student select maximised - select the option
    if(studentSelect.classList.contains('active')){
      
      // prevent from bubling up to the student select
      event.preventDefault();

      // set the option
      studentSelectModel.selectOption(event.target.value);
      // change the page
      try{
        let activePage = studentSelectModel.nextPage();
      }catch(e){
        if(/Page limit reached/i.test(e.message)){
          console.log("end page")
        }
      }
      
      // display the new page
      updateStudentSelectDisplay(studentSelectModel.getSelectedOptions());

    }else{
      
    }

    
  }

  // set up the stream
  const getStream = ()=>{
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
      console.log('getUserMedia supported');
      
      // get the stream to listen to
      return navigator.mediaDevices.getUserMedia({ audio:true }) // only audio needed for this app
      .catch((err)=>{
        console.log(`The following getUserMedia error occured: ${err}`)
      })
    }else{
      console.log(`getUserMedia not supported on your browser`)
    }
  }

  // store an audio clip in the database
  const storeAudioClip = ({
    audioBlob,
    classId,
    lessonId,
    studentIds
  })=>{
    return dbHelper.addClip({classId, lessonId, studentIds, audioData:audioBlob})
  }

  // combine audio chunks into one file
  const mergeChunks = (audioChunks)=>{
    return newBlob(audioChunks, {'type': 'audio/ogg; codecs=opus'})
  }

  // start/stop the recording
  const toggleRecord = (event)=>{

    mediaRecorder.then((recorder)=>{
      switch(recorder.state){
        case 'inactive':
          recorder.start()
          event.target.parentNode.classList.add('recording');
        break;
        case 'recording':
          recorder.stop();
          event.target.parentNode.classList.remove('recording');
        break;
        case 'paused':
        break;
      }
      
    })
    
  }





  // = PLAYBACK FUNCTIONS 

  // show/hide the filter window
  const filterOptionSelectClicked = ({event, optionType})=>{

    let optionId = event.target.value;

    // prevent if filterSelectContainer is not active
    if(!clipFilterContainer.classList.contains('active')){
      // set the new filter
      switch(optionType){
        case 'class':
          clipFilterModel.setFilter({filterType: optionType, filterOption: optionId});
        break;
        case 'lesson':
          clipFilterModel.setFilter({filterType: optionType, filterOption:optionId})
        break;
        case 'student':
          clipFilterModel.setFilter({filterType: optionType, filterOption:optionId})
        break;
        default:
          throw new Error(`Invalid filterType: ${optionType}`)
        break;
      }

      // update the display
      updateFilterDisplay()

    }else{
      // prevent from bubbling to the clipFilterContainer
      event.preventDefault();
      return;
    }

  }





  // = DISPLAY FUNCTIONS  


  // generate elements to fill the list with clickable options
  const generateOptionElements = ({
    optionLabel= "option",
    optionList = [],
    multiSelect = false,
    selectedOptions = [],
    clickFunction = ()=>{console.log("default click function")}
  })=>{
    const optionElements = [];

    optionList.forEach(({id, labelText})=>{
      const element= document.createElement('input');
      const elementLabel = document.createElement('label');
      const elementId = `${optionLabel}-${id}`;


      element.id = elementId;
      element.type = 'checkbox';
      element.value = id;
      element.onclick = clickFunction;
      if(selectedOptions.includes(id)) element.checked = true;

      elementLabel.setAttribute('for',elementId)
      elementLabel.innerText = labelText;

      optionElements.push(element)
      optionElements.push(elementLabel)
    })

    return optionElements
  }

  // generate a html block for the playback of an element
  const generatePlaybackBlock = ({
    clipName = "audio clip",
    audioURL = undefined,
  }= {})=>{
    var clipContainer = document.createElement('article');
    var clipLabel = document.createElement('p');
    var audioElement = document.createElement('audio');
    var deleteButton = document.createElement('button');

    clipContainer.classList.add('audio-clip');

    clipLabel.innerText = clipName;

    audioElement.setAttribute('controls','');
    audioElement.src= audioURL;

    deleteButton.innerText = "Delete Clip";

    deleteButton.onclick = (e)=>{
      var evtTgt = e.target;
      evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
    }

    clipContainer.appendChild(deleteButton);
    clipContainer.appendChild(clipLabel);
    clipContainer.appendChild(audioElement);
    
    return clipContainer;
  }

  const generateAudioClip = ({
    clipTitle = "Title",
    clipName = 'audio clip',
    clipStudents = "Some Students",
    audioURL = undefined
  }={})=>{
    let clipContainer = document.createElement('article');
    let clipInfoContainer = document.createElement('div')
    let clipTitleElement = document.createElement('h3');
    let clipStudentsElement = document.createElement('p');
    let clipNameElement = document.createElement('p');
    let audioElement = document.createElement('audio');
    let playButton = document.createElement('button');
    let playButtonImage = document.createElement('img')

    // add classes to all containers
    clipContainer.classList.add('audio-clip');
    clipInfoContainer.classList.add('clip-info');
    clipTitleElement.classList.add('clip-class-lesson');
    clipStudentsElement.classList.add('clip-students');
    playButton.classList.add('clip-play-button', 'shadow');

    // fill in all the text
    clipTitleElement.innerText = clipTitle;
    clipStudentsElement.innerText = clipStudents;

    // attach the audio element to the sound data
    audioElement.src= audioURL

    playButtonImage.src="img/play-button.svg";
    // set the event listener on the play button
    playButton.onclick = ()=>{
      audioElement.play();
    }

    clipContainer.appendChild(clipInfoContainer);
    // populate the clip info
    clipInfoContainer.appendChild(clipTitleElement);
    clipInfoContainer.appendChild(clipStudentsElement);
    clipInfoContainer.appendChild(clipNameElement);

    // attach the playButton
    clipContainer.appendChild(playButton);
    playButton.appendChild(playButtonImage);

    return clipContainer;
  }

  const generateFilterSectionElement = ({ sectionName= "default", active= false })=>{
    let sectionTitle = document.createElement('h2');
    let filterSection = document.createElement('section');

    sectionTitle.innerText = sectionName;

    filterSection.classList.add(`${sectionName}-filter`, 'option-div')
    if(active) filterSection.classList.add('active');

    filterSection.appendChild(sectionTitle);

    return filterSection;
  }


  const fillOptions = ({fillPage, selectedClass, selectedOptions})=>{
    var options;

    switch(fillPage){
      case 'class':
        // clear the class page

        // fill the class list

          // get all the classObjects (offline and online)
        return dbHelper.getClasses()
        .then( classObjects =>{
          return classObjects.map( classObject =>{
            return {id:classObject.classId, labelText: classObject.className}
          })
        })
        .then( optionObjects =>{

          emptyHTML(studentSelect_classList);
          return generateOptionElements({optionLabel:'sselect-class', optionList:optionObjects, selectedOptions, clickFunction:studentSelectOptionClicked})
        })
        .then( optionElements =>{
          optionElements.forEach(( element )=>{
            studentSelect_classList.appendChild(element)
          })
        })
      break;
      case 'lesson':
        
        return dbHelper.getLessons(selectedClass)
        // format data for options generator
        .then((lessonsForClass)=>{
          return lessonsForClass.map( lessonObject =>{
            return {id: lessonObject.lessonId, labelText: lessonObject.lessonName}
          })
        })
        // generate the HTML elements
        .then( (optionObjects)=>{
          return generateOptionElements({optionLabel:'sselect-lesson', optionList:optionObjects, selectedOptions, clickFunction: studentSelectOptionClicked})
        })
        // add each element to the right page
        .then( lessonElements =>{
          emptyHTML(studentSelect_lessonList);
          lessonElements.forEach(lessonElement => {
            studentSelect_lessonList.appendChild(lessonElement)
          })
        })
        
      break;
      case 'student':

        // get the selected class (offline or online)
        return dbHelper.getClass(selectedClass)
        // get each of the students objects on the class (offline and online)
        .then((classObject)=>{
          return Promise.all(classObject.attachedStudents.map((studentId)=>{
            return dbHelper.getStudent(studentId);
          }))
        })
        // format the student object for creating object element
        .then( (studentArray)=>{
          return studentArray.map( studentObject =>{
            return {id: studentObject.studentId, labelText: studentObject.studentName}
          })
        })
        // generate the option HTML
        .then(( optionObjects )=>{
          return generateOptionElements({
            optionLabel:'sselect-student',
            optionList:optionObjects,
            multiSelect:true, selectedOptions,
            clickFunction: studentSelectOptionClicked})
        })
        // attach the HTML to the document
        .then( (studentElements)=>{
          emptyHTML(studentSelect_studentList)
          studentElements.forEach( studentElement =>{
            studentSelect_studentList.appendChild(studentElement)
          })
        })
      break
    }
  }

  const showStudentSelectPage = (selectedPageName)=>{
      // remove active class from all pages
      let sselectPages = document.querySelectorAll('.sselect-page');
      sselectPages.forEach( page => page.classList.remove('active'));

      // add the active class to the appropriate page
      let activePage = document.querySelector(`.sselect-page.${selectedPageName}`);
      activePage.classList.add('active');
  }

  const emptyHTML = (htmlElement)=>{
    while(htmlElement.children.length > 0){
      htmlElement.children[0].remove()
    }
    return htmlElement
  }

  const setSelectTitle = (titleText)=>{
    studentSelect_title.innerText = titleText;
  }






  // == DISPLAY UPDATE FUNCTIONS

  // update the html element carrying student select options
  const updateStudentSelectDisplay = (selectState)=>{

    // if no class selected - show the classes
    if(selectState.class == undefined){
      fillOptions({fillPage:'class', selectedOptions: [selectState.class]}).then(()=>{
        showStudentSelectPage('class')
      })
    }else if(selectState.lesson == undefined){
      // no lesson selected - show the lessons
      fillOptions({fillPage: 'lesson', selectedClass: selectState.class, selectedOptions:[selectState.lesson] }).then(()=>{
        showStudentSelectPage('lesson')
      })
      
    }else{
      // students are selected - show the students
      fillOptions({fillPage: 'student', selectedClass: selectState.class, selectedOptions:selectState.student }).then(()=>{
        showStudentSelectPage('student')
      })
    }

    updateStudentSelectTitle(selectState);
  }
  
  // update the html element carrying the student select title
  const updateStudentSelectTitle = (selectState)=>{
    
    let requests = []

    if(selectState.class) requests.push(dbHelper.getClass(selectState.class))
    if(selectState.lesson) requests.push(dbHelper.getLesson(selectState.lesson))

    Promise.all(requests)
    .then((response)=>{
      let titleText = "";
      
      switch(response.length){
        case 2: // class & lesson
          titleText = ' | '.concat(response[1].lessonName)
        case 1: // class only
          titleText = response[0].className.concat(titleText)
        default:
          titleText = "◀ ".concat(titleText)
      }

      setSelectTitle(titleText);  
    })

  }

  // update the html element carrying the list of audio clips
  const updateClipList = ({searchType, searchKey})=>{

    let clipRequest;

    switch(searchType){
      case "class":
        clipRequest = dbHelper.getClipsByClass(searchKey);
      break;
      case "lesson":
        clipRequest = dbHelper.getClipsByLesson(searchKey);
      break;
      case "student":
        clipRequest = dbHelper.getClipsByStudent(searchKey);
      break;
      default:
        throw new Error(`Cannot get clips from db: searchType ${searchType} not supported`)
    }

    // get the clip information
    clipRequest.then( clipObjects =>{

      // remove the current clips
      emptyHTML(clipListDisplay);


      // get the data for the class/lesson/student info

      // add the new clips in
      clipObjects.forEach((clipObject)=>{

        // get the details of the classes/lessons/students attached to the clip
        return dbHelper.getCompleteInfo({
          classId:clipObject.classId,
          lessonId:clipObject.lessonId,
          studentIds:clipObject.studentIds
        }).then( clipInfo =>{

          let studentNames = clipInfo.students.map(studentObject => studentObject.studentName)


          let audioURL = window.URL.createObjectURL(clipObject.audioData);
          let clipTitle = `${clipInfo.class.className} | ${clipInfo.lesson.lessonName}`
          let clipStudents = studentNames.join(", ");


          clipListDisplay.appendChild(generateAudioClip( {audioURL, clipTitle, clipStudents} ))
        })
        
      })
    })

  }

  // update the html element carrying the filter options
  const updateFilterDisplay = ({ filterState = clipFilterModel.filterSettings }={})=>{

    let sectionPromises = []
    let filterTitleText = "";

    // == CREATE CLASS SECTION

    // get class data
    sectionPromises[0] = dbHelper.getClasses()
    // process to right format for generating option elements
    .then( (classObjects)  =>{
      return classObjects.map( ({ classId, className }) =>{
        return {id: classId, labelText: className}
      })
    })
    // generate the option elements
    .then( ( optionObjects )=>{
      return generateOptionElements({
        optionLabel:'filter-class',
        optionList: optionObjects,
        selectedOptions:[filterState.class],
        clickFunction:(event)=>{ filterOptionSelectClicked({event,optionType:'class'}) }
      })
    
    })
    // attach options to section and return section
    .then( optionElements =>{
      // generate the section container
      let classSection = generateFilterSectionElement({sectionName:'Class'});
      
      optionElements.forEach( (element, index) =>{
        classSection.appendChild(element);
      })

      return classSection;
    })
    
    // == CREATE LESSON SECTION

    // if we have a class we need to show the lesson list
    if(filterState.class != undefined){
      // get the lesson data - adding promise to the list
      sectionPromises[1] = dbHelper.getLessons(filterState.class)
      // process into option element format
      .then( lessonObjects =>{
        return lessonObjects.map( ({lessonId, lessonName }) =>{
          return {id: lessonId, labelText: lessonName}
        })
      })
      // generate option elements
      .then ( optionObjects =>{
        return generateOptionElements({
          optionLabel: `filter-lesson`,
          optionList: optionObjects,
          selectedOptions: [filterState.lesson],
          clickFunction: (event)=>{ filterOptionSelectClicked({event, optionType: 'lesson'}) }
        })
      })
      // then attach options to lesson and return section
      .then ( optionElements =>{
        let lessonSection = generateFilterSectionElement({sectionName:'Lesson'})
        optionElements.forEach( element => lessonSection.appendChild(element) )
        return lessonSection;
      })
    }
    
    
    // == CREATE STUDENT SECTION

    // if we have a lesson we need to show a student list
    if(filterState.lesson != undefined){
      // get the students in the class
      sectionPromises[2] = dbHelper.getClass(filterState.class)
      // get each student in the class
      .then( ({attachedStudents}) =>{
        return Promise.all( attachedStudents.map( studentId =>{
          return dbHelper.getStudent(studentId)
        }))
      })
      // format studentObjects into option format
      .then( studentObjects =>{
        return studentObjects.map( ({studentId, studentName}) =>{
          return {id: studentId, labelText: studentName}
        })
      })
      // generate option elements
      .then( optionObjects =>{
        return generateOptionElements({
          optionLabel: 'filter-student',
          optionList: optionObjects,
          selectedOptions: [filterState.student],
          clickFunction: (event)=>{ filterOptionSelectClicked({event, optionType: 'student'})}
        })
      })
      // attach option elements to section element and return
      .then( optionElements =>{
        let studentSection = generateFilterSectionElement({sectionName: 'Student'})
        optionElements.forEach( element => studentSection.appendChild(element) );
        return studentSection
      })
    }


    Promise.all(sectionPromises)
    // attach all the promises to the filter list
    .then( filterSections =>{
      // make the last one in the list active
      filterSections[filterSections.length-1].classList.add('active');
      // clear the container
      emptyHTML(filterOptionContainer)
      // add the filter button
      filterSections.forEach( section =>{
        filterOptionContainer.appendChild(section);
      })
    // update the filter title
    }).then( ()=>{
      // get the names
      return dbHelper.getNames({
        classId:filterState.class,
        lessonId:filterState.lesson,
        studentIds:[filterState.student]
      
      })
      // combine names into a title
      .then( names =>{
        let titleText = "";
        if(names.className != undefined) titleText = titleText.concat(names.className)
        if(names.lessonName != undefined) titleText = titleText.concat(` | ${names.lessonName}`)
        if(names.studentNames != undefined) titleText = titleText.concat(` | ${names.studentNames[0]}`)
        if(titleText == "") titleText = "Set Filter"
        return titleText
      })
      .then( titleText =>{
        clipFilterTitle.innerText = titleText
      })
    })
    
  }


  // ITEM CREATE FORMS

  const generateItemCreateForm = (itemCreateType, submitCallback)=>{
    // fill with appropriate form
    switch(itemCreateType){
      case 'class':

        // get all students
        return dbHelper.getAllStudents()
        // format for the options
        .then( studentObjects =>{
          return studentObjects.map( studentObject =>{
            return {id: studentObject.studentId, labelText:studentObject.studentName}
          })
        // return the class form
        }).then( studentOptions =>{
          return ItemCreateHelper.generateClassForm({ studentOptions, submitCallback })
        })
      break;
      case 'lesson':

        // get the classes
        return dbHelper.getClasses()
        // format the options
        .then( classObjects =>{
          return classObjects.map( ({classId, className}) =>{
            return{id: classId, labelText: className}
          })
        })
        // return the lesson form
        .then( optionObjects =>{
          return ItemCreateHelper.generateLessonForm({
            classOptions: optionObjects,
            submitCallback
          })
        })
        
      break;  
      case 'student':
        // return the student form 
        return ItemCreateHelper.generateStudentForm({submitCallback});
      break;
      default: throw new Error(`No recognised item type: ${itemCreateType}`)
    }
  }

  const updateItemCreate =  (itemCreateType)=>{

    // clear all the containers
    document.querySelectorAll('.item-create-form').forEach(emptyHTML);

    let container;
    let submitCallback;


    // fill with appropriate form
    switch(itemCreateType){
      case 'class':
        container = document.querySelector('.item-create-form.class');

        // submit callback
        submitCallback = ({ className, attachedStudents})=>{
          dbHelper.addOfflineClass({className, attachedStudents})
        }
        // get the form
        generateItemCreateForm('class', submitCallback).then( formElement =>{
          container.appendChild(formElement)
        })
      break;
      case 'lesson':
        container = document.querySelector('.item-create-form.lesson');

        submitCallback = ({lessonName, lessonDate, attachedClass})=>{
        
          dbHelper.getClass(attachedClass).then( ({attachedStudents}) =>{

            dbHelper.addOfflineLesson({lessonName, lessonDate, attachedClass, attachedStudents })

          })

        }

        // get the student form
        generateItemCreateForm('lesson', submitCallback)
        .then( formElement => container.appendChild(formElement))
        
      break;  
      case 'student':
        container = document.querySelector('.item-create-form.student');

        submitCallback = ({studentName})=>{
          dbHelper.addOfflineStudent({studentName});
        }

        const studentForm = generateItemCreateForm('student', submitCallback)
        container.appendChild(studentForm);
      break;
      default: throw new Error(`No recognised item type: ${itemCreateType}`)
    }
    
  }

  const updateItemCreateModify = (itemModifyType, itemId)=>{
    
    // clear all the containers
    document.querySelectorAll('.item-create-form').forEach(emptyHTML);

    let container;
    let submitCallback;

    // fill with appropriate form
    switch(itemModifyType){
      case 'class':
        container = document.querySelector('.item-create-form.class');

        // submit callback
        submitCallback = ({ className, attachedStudents})=>{
          dbHelper.modifyOfflineClass({classId: itemId,className, attachedStudents})
        }
        // get the form
        generateItemCreateForm('class', submitCallback)
        // pre-fill the form with class details
        .then( classCreateForm =>{
          // get the class
          return dbHelper.getClass(itemId)
          // combine the class Object with the form
          .then( classObject =>{
            return ItemCreateHelper.prefillForm({
              generatedForm: classCreateForm,
              classObject
            })
          })
        })
        // add the form to the container
        .then( formElement =>{
          container.appendChild(formElement)
        })
      break;
      case 'lesson':
        container = document.querySelector('.item-create-form.lesson');

        submitCallback = ({lessonName, lessonDate, attachedClass})=>{
        
          // get the attached class' student to add to the lesson
          dbHelper.getClass(attachedClass)
          // modify the lesson object in memory
          .then( ({attachedStudents}) =>{
            dbHelper.modifyOfflineLesson({lessonId:itemId,lessonName, lessonDate, attachedClass, attachedStudents })
          })

        }

        // get the student form
        generateItemCreateForm('lesson', submitCallback)
        // prefill the lesson values in the form
        .then( lessonCreateForm =>{
          // get the lessonObject to pre-fill
          return dbHelper.getLesson(itemId)
          // combine the lesson object with the form
          .then( lessonObject =>{
            return ItemCreateHelper.prefillForm({
              generatedForm: lessonCreateForm,
              lessonObject
            })
          })
        })
        // add the from element to the page
        .then( formElement => container.appendChild(formElement))
        
      break;  
      case 'student':
        container = document.querySelector('.item-create-form.student');

        submitCallback = ({studentName})=>{
          dbHelper.modifyOfflineStudent({studentId:itemId,studentName});
        }

        // get the student
        dbHelper.getStudent(itemId)
        // generate the form & combine with student object
        .then( studentObject =>{
          let studentForm = generateItemCreateForm('student', submitCallback);
          return ItemCreateHelper.prefillForm({generatedForm: studentForm, studentObject})
        })
        // attached filled form to the document
        .then( filledForm =>{
          container.appendChild(filledForm);
        })

       
      break;
      default: throw new Error(`No recognised item type: ${itemCreateType}`)
    }
  }

  const itemCreateDropdownCallback = ()=>{
    var operationType = itemCreateOperationDropdown.value;
    var itemType = itemCreateTypeDropdown.value;

    
    switch(operationType){
      case 'create':
        updateItemCreate(itemType)
      break;
      case 'modify':
        var selectOptions;

        emptyHTML(itemModifyItemSelect);

        // get the select options - format then to option objects
        switch(itemType){
          case 'class':
            selectOptions = dbHelper.getClasses().then( classObjects=>{
              return classObjects.map(classObject =>{
                return {
                  labelText: classObject.className,
                  id: classObject.classId
                }
              })
            });
          break;
          case 'lesson':
            selectOptions = dbHelper.getLessons( lessonObjects =>{
              return lessonObjects.map(lessonObject =>{
                return{
                  labelText: lessonObject.lessonName,
                  id: lessonObject.lessonId
                }
              })
            });
          break;
          case 'student':
            selectOptions = dbHelper.getAllStudents( studentObjects =>{
              return studentObjects.map( studentObject =>{
                return{
                  labelText: studentObject.studentName,
                  id: studentObject.studentId
                }
              })
            });
          break;
        }

        selectOptions.then( itemOptions =>{
          // !TODO: see if these itemOptions are making it to the list properly
          return ItemCreateHelper.generateModifyItemSelect({
            labelText : `Select ${itemType}`,
            listId: 'modify-item-option',
            itemObjects: itemOptions,
            modifyItemSelectCallback: ({itemId})=>{
              updateItemCreateModify(itemType, itemId)
            }
          })
        })
        .then( selectOptionElements =>{
          selectOptionElements.forEach( selectOption => itemModifyItemSelect.appendChild(selectOption))
        })

      break;
      default:
        console.log(`unknown operation ${operationType}`)
      break
    }  
    // if its a modify

  }


  //    === INIT / IMPLEMENTATION    == 

  // populate data to the database
  dbHelper.populateDatabase()

  // set up the media recorder
  mediaRecorder = getStream().then(createRecorder).then(recorder => {return recorder});

  // set up tab navigation
  navTabs.forEach( tabElement => tabElement.onclick = navTabClicked)

  // event listener on the student select title to go back a page
  studentSelect_title.addEventListener('click',(event)=>{

    let selectedPageName;
    // if the select is NOT active
    if(studentSelect.classList.contains('active')){
      // prevent the bubbling from triggering the studentSelect collapse
      event.cancelBubble = true;
      // move to previous page
      try{
        // get what the next page is
        selectedPageName = studentSelectModel.prevPage() || 'class'

        // clear the selected option
        studentSelectModel.clearOption(selectedPageName);
        
        // move to the next page
        showStudentSelectPage(selectedPageName);
          // seems to be working - except its a page out (e.g. title shows current page selection)
        updateStudentSelectTitle(studentSelectModel.selectedOptions);
          
      }catch(error){
        if(/Page limit reached/i.test(error.message)){
          console.log("got to the end of the page")
        }else{
          throw error
        }
      }

    }
  })
  

  // event listener to expand the student select 
  studentSelect.addEventListener('click',(event)=>{

    let overrideElementClicked = ['LABEL','INPUT', 'H2'].includes(event.target.nodeName);

    // if student select is active
    if(studentSelect.classList.contains('active')){
      // && element clicked isn't a label or a heading
      if( !overrideElementClicked ){
        // collapse the student select
        studentSelect.classList.remove('active');
        recordButton.classList.remove('hidden')
      } 
    }else{
      studentSelect.classList.add('active')
      recordButton.classList.add('hidden');
    }
    
  })

  // event listener to expand the filter
  clipFilterContainer.addEventListener('click',(event)=>{

    // When filter active/expanded - don't want filter to collapse when input/label or title clicked 
    let overrideElementClicked_active = ['H2'].includes(event.target.nodeName);
    // When filter inactive/collapsed - don't want the filter to expand when apply filter button clicked
    let overrideElementClicked_inactive = ['BUTTON'].includes(event.target.nodeName);

    // if clip filter active
    if(clipFilterContainer.classList.contains('active')){
      // only collapse if an override element NOT clicked
      if(!overrideElementClicked_active){
        clipFilterContainer.classList.remove('active');
        clipListDisplay.classList.remove('hidden');
      } 
    }else{
      // only expand if an override element is not clicked
      if(!overrideElementClicked_inactive){
        clipFilterContainer.classList.add('active');
        clipListDisplay.classList.add('hidden')
      } 
    }

  })
  

  // add eventListener to the record button
  recordButton.onclick = toggleRecord;

  // event listener to expand the clip filter
  clipFilterButton.onclick = (event)=>{
    let filterSettings = clipFilterModel.filterSettings;
    let filterType;
    let searchKey;

    if(filterSettings.student != undefined){
      filterType = 'student';
      searchKey = filterSettings.student
    }else if(filterSettings.lesson != undefined){
      filterType = 'lesson';
      searchKey = filterSettings.lesson
    }else if( filterSettings.class != undefined){
      filterType = 'class';
      searchKey = filterSettings.class
    }else{
      throw new Error('No filter settings applied');
      return;
    }

    updateClipList({searchType: filterType, searchKey})
  }

  itemCreateTypeDropdown.addEventListener('change', itemCreateDropdownCallback);
  itemCreateOperationDropdown.addEventListener('change', itemCreateDropdownCallback);

  // display the current student select list
  updateStudentSelectDisplay(studentSelectModel.getSelectedOptions());
  // update the clip filter display
  updateFilterDisplay()
  updateItemCreate('class');

  return {
    dbHelper,
    studentSelectModel,
    updateFilterDisplay,
    updateItemCreate,
    updateItemCreateModify
  }
}();