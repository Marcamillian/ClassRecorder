'use strict';

// tutorial used - https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API
const recorderApp = function RecorderApp(){ 
  // html elements
  var recordButton = document.querySelector('button.button-record');

  var studentSelect = document.querySelector('.student-select');
  var studentSelect_studentList = document.querySelector('.sselect-page.student');
  var studentSelect_lessonList = document.querySelector('.sselect-page.lesson');
  var studentSelect_classList = document.querySelector('.sselect-page.class');
  var studentSelect_title = document.querySelector('.student-select .title');

  var playbackContainer = document.querySelector('.tab-body.playback');
  var clipFilterContainer = document.querySelector('.clip-filter');

  // module for selecting the players
  let studentSelectModel = new StudentSelectPageModel();
  let clipFilterModel = new FilterModel();  // for selecting the clip filter

  // data helper
  let dbHelper = new DBHelper();

  // media recording things
  var mediaRecorder;
  let chunks = [];
  


  // == RECORDER FUNCTIONS == 


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
      
      console.log(recorder.state)
    })
    
  }

  const filterOptionSelect = ({event, optionType})=>{

    let optionId = Number(event.target.value);

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

  }

  // === DISPLAY FUNCTIONS === 


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

  const generateFilterSectionElement = ({ sectionName= "default", active= false })=>{
    let sectionTitle = document.createElement('h2');
    let filterSection = document.createElement('section');

    sectionTitle.innerText = sectionName;

    filterSection.classList.add(`${sectionName}-filter`, 'option-div')
    if(active) filterSection.classList.add('active');

    filterSection.appendChild(sectionTitle);

    return filterSection;
  }

  const studentSelectOptionClicked = (event)=>{

    // if student select maximised - select the option
    if(studentSelect.classList.contains('active')){
      
      // prevent from bubling up to the student select
      event.preventDefault();

      // set the option
      studentSelectModel.selectOption(Number(event.target.value))
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

  const fillOptions = ({fillPage, selectedClass, selectedOptions})=>{
    var options;

    switch(fillPage){
      case 'class':
        // clear the class page

          // fill the class list
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
        .then((lessonsForClass)=>{
          // format data for options generator
          return lessonsForClass.map( lessonObject =>{
            return {id: lessonObject.lessonId, labelText: lessonObject.lessonName}
          })
        })
        .then( (optionObjects)=>{
          // generate the elements
          return generateOptionElements({optionLabel:'sselect-lesson', optionList:optionObjects, selectedOptions, clickFunction: studentSelectOptionClicked})
        })
        .then( lessonElements =>{
          emptyHTML(studentSelect_lessonList);
          // add each element to the right page
          lessonElements.forEach(lessonElement => {
            studentSelect_lessonList.appendChild(lessonElement)
          })
        })
        
      break;
      case 'student':

        return dbHelper.getClass(selectedClass)
        .then((classObject)=>{
          return Promise.all(classObject.attachedStudents.map((studentId)=>{
            return dbHelper.getStudent(studentId);
          }))
        })
        .then( (studentArray)=>{
          return studentArray.map( studentObject =>{
            return {id: studentObject.studentId, labelText: studentObject.studentName}
          })
        })
        .then(( optionObjects )=>{
          return generateOptionElements({
            optionLabel:'sselect-student',
            optionList:optionObjects,
            multiSelect:true, selectedOptions,
            clickFunction: studentSelectOptionClicked})
        })
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

   // === populate the studentSelectPages from the current studentSelectModel
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

  const updateClipList = (searchType, searchKey)=>{

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

    clipRequest.then( clipObjects =>{

      // remove the current clips
      emptyHTML(playbackContainer);

      // add the new clips in
      clipObjects.forEach((clipObject)=>{

        let audioURL = window.URL.createObjectURL(clipObject.audioData);
        let clipName = `${ clipObject.recordedDate }`

        playbackContainer.appendChild(generatePlaybackBlock( {clipName, audioURL} ))
      })
    })

    /*
    dbHelper.getClip(clipId).then((clipObject)=>{
      var audioURL = window.URL.createObjectURL(clipObject.audioData);
      let clipElement = generatePlaybackBlock({clipName: "some clip", audioURL})
  
      playbackContainer.appendChild(clipElement);
    })*/
  }


  //    ==  PLAYBACK PAGE FUNCTIONS
  const updateFilterDisplay = ({ filterState = clipFilterModel.filterSettings }={})=>{

    let filterButton = document.createElement('button');
    let classSection;


    filterButton.innerText = 'Filter';
    filterButton.onclick = ()=>{console.log("Trying to filter")}
    
    // get class data
    dbHelper.getClasses()
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
        clickFunction:(event)=>{ filterOptionSelect({event,optionType:'class'}) }
      })
    
    })
    // attach all the elements to the document
    .then( optionElements =>{

      
      // generate the section container
      classSection = generateFilterSectionElement({sectionName:'Class', active:true});
      
      optionElements.forEach( element =>{
        classSection.appendChild(element)  
      })


      // do this towards the end when everything returned
      emptyHTML(clipFilterContainer);
      clipFilterContainer.appendChild(filterButton);
      clipFilterContainer.appendChild(classSection);
    })

    
    // nothing defined
      // generate class list
    // class defined
      // generate class - selected
      // generate lesson list
    // lesson defined
      // generate class - selected
      // generate lesson - selected
      // generate student list
    // student defined
      // generate class - selected
      // generate lesson - selected
      // generate student list - selected



  }



  //    ==   IMPLEMENTATION DETAILS    == 


  // populate data to the database
  dbHelper.populateDatabase()

  mediaRecorder = getStream().then(createRecorder).then(recorder => {return recorder});

  
  // event listener on the student select title to go back a page
  studentSelect_title.addEventListener('click',(event)=>{

    let selectedPageName;
    // if the select is NOT active
    if(studentSelect.classList.contains('active')){
      // prevent the bubbling from triggering the studentSelect collapse
      event.cancelBubble = true;
      // move to previous page
      try{
        // clear the selected option
        studentSelectModel.clearOption();
        // go to next page
        selectedPageName = studentSelectModel.prevPage() || 'class'
        showStudentSelectPage(selectedPageName);
          
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
        studentSelect.classList.remove('active')
      } 
    }else{
      studentSelect.classList.add('active')
    }

    
  })
  

  // add eventListener to the record button
  recordButton.onclick = toggleRecord;


  // display the current student select list
  updateStudentSelectDisplay(studentSelectModel.getSelectedOptions());
  updateFilterDisplay()

  return {
    dbHelper,
    studentSelectModel,
    mediaRecorder,
    updateStudentSelectDisplay,
    updateClipList,
    updateFilterDisplay,
    studentSelect
  }
}();