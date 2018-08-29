'use strict';

// tutorial used - https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API
const recorderApp = function RecorderApp(){ 
  // html elements
  var record = document.querySelector('.record');
  var stop = document.querySelector('.stop');
  var soundClips = document.querySelector('.sound-clips');
  var mainControls = document.querySelector('.main-controls')
  var studentSelect = document.querySelector('.student-select');
  var studentSelect_studentList = document.querySelector('.sselect-page.student');
  var studentSelect_lessonList = document.querySelector('.sselect-page.lesson');
  var studentSelect_classList = document.querySelector('.sselect-page.class');
  var studentSelect_title = document.querySelector('.student-select .title');

  // module for selecting the players
  var studentSelectModel = new StudentSelectPageModel();

  // data helper
  var dbHelper = new DBHelper();

  // media recording things
  var mediaRecorder;
  var chunks = [];
  
  // populate data to the database
  dbHelper.populateDatabase()





  // == RECORDER FUNCTIONS == 


  // create the media recorder object from a stream
  const createRecorder = (stream)=>{

    let recorder = new MediaRecorder(stream);

    // event listener for when each chunk is ready
    recorder.ondataavailable = (e)=>{
      chunks.push(e.data)  
    }

      // event listener when all of the data is recorded
    recorder.onstop = (e)=>{
      var clipName = prompt('Enter a name for your sound clip');

      var clipContainer = document.createElement('article');
      var clipLabel = document.createElement('p');
      var audio = document.createElement('audio');
      var deleteButton = document.createElement('button');

      clipContainer.classList.add('clip');
      audio.setAttribute('controls', '');
      deleteButton.innerHTML = "Delete";
      clipLabel.innerHTML = clipName;

      clipContainer.appendChild(audio);
      clipContainer.appendChild(clipLabel);
      clipContainer.appendChild(deleteButton);
      soundClips.appendChild(clipContainer);

      var blob = new Blob(chunks, {'type': 'audio/ogg; codecs=opus'});
      chunks = [];
      var audioURL = window.URL.createObjectURL(blob);
      audio.src= audioURL;

      deleteButton.onclick = (e)=>{
        var evtTgt = e.target;
        evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode)
      }
    }


    return recorder;
  }

  // generate a html block for the playback of an element
  const genPlaybackBlock = ({
    clipName = "audio clip",
    audioURL = undefined,
  }= {})=>{
    var clipContainer = document.createElement('article');
    var clipLabel = document.createElement('p');
    var audio = document.createElement('audio');
    var deleteButton = document.createElement('button');

    clipContainer.classList.add('audio-clip');
    audio.setAttribute('controls','');
    deleteButton.innerText = "Delete Clip";
    clipName.innerText = clipName;

    deleteButton.onclick = (e)=>{
      var evtTgt = e.target;
      evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
    }

    clipContainer.appendChild(deleteButton);
    clipContainer.appendChild(clipLabel);
    clipContainer.appendChild(audio);
    
    return clipContainer;
  }

  // store an audio clip in the database
  const storeAudioClip = ({
    audioBlob,
    clipName,
    clipTags = []
  })=>{
    clipName = (clipName == undefined) ? `audioclip-${new Date()}` : clipName;
  }

  // combine audio chunks into one file
  const mergeChunks = (audioChunks)=>{
    return newBlob(audioChunks, {'type': 'audio/ogg; codecs=opus'})
  }





  // === DISPLAY FUNCTIONS === 


  // generate html for student elements to select
  const generateStudents = (studentList = [])=>{
    const studentElements = [];

    studentList.forEach(({studentId, studentName})=>{
      const element= document.createElement('input');
      const elementLabel = document.createElement('label');
      const elementId = `select-${studentId}`;


      element.id = elementId;
      element.type = 'checkbox';
      element.value = studentId;

      elementLabel.setAttribute('for',elementId)
      elementLabel.innerText = studentName;
      elementLabel.addEventListener('click', (event)=>{
        // stop the nornal operation if not active
        if(!studentSelect.classList.contains('active')){
          console.log("not active")
          event.preventDefault()
          studentSelect.classList.toggle('active')
        }else{
          console.log("its active now")
        }
      });

      studentElements.push(element)
      studentElements.push(elementLabel)
    })

    return studentElements
  }

  const generateOptionElements = (optionLabel= "option", optionList = [], multiSelect = false)=>{
    const optionElements = [];

    optionList.forEach(({id, labelText})=>{
      const element= document.createElement('input');
      const elementLabel = document.createElement('label');
      const elementId = `${optionLabel}-${id}`;


      element.id = elementId;
      element.type = 'checkbox';
      element.value = id;
      element.onclick = selectOption;

      elementLabel.setAttribute('for',elementId)
      elementLabel.innerText = labelText;
      elementLabel.addEventListener('click', (event)=>{
        // stop the nornal operation if not active
        if(!studentSelect.classList.contains('active')){
          event.preventDefault()
          studentSelect.classList.toggle('active')
        }else{
          console.log("its active now")
          if(multiSelect == false){
            // clear the setting on the other options
            // get the container they are in
            let optionContainer = event.target.parentNode;
            // get all of the checkboxes in the container
            let optionCheckboxes = optionContainer.querySelectorAll('input')
            // clear them of the checked setting
            optionCheckboxes.forEach(element => element.checked = false);
          }
        }
      });

      optionElements.push(element)
      optionElements.push(elementLabel)
    })

    return optionElements
  }

  const selectOption = (event)=>{
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
    updateStudentSelectDisplay();
  }

  const fillOptions = ({fillPage, selectedClass})=>{
    var options;

    switch(fillPage){
      case 'class':
        // clear the class page

          // fill the class list
        dbHelper.getClasses()
        .then( classObjects =>{
          return classObjects.map( classObject =>{
            return {id:classObject.classId, labelText: classObject.className}
          })
        })
        .then( optionObjects =>{

          emptyHTML(studentSelect_classList);
          generateOptionElements('class',optionObjects).forEach(( element )=>{
            studentSelect_classList.appendChild(element)
          })
        })
      break;
      case 'lesson':

        // TODO: clear the lesson page
        
        dbHelper.getLessons(selectedClass)
        .then((lessonsForClass)=>{
          // format data for options generator
          return lessonsForClass.map( lessonObject =>{
            return {id: lessonObject.lessonId, labelText: lessonObject.lessonName}
          })
        })
        .then( (optionObjects)=>{
          // generate the elements
          return generateOptionElements('lesson', optionObjects)
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
        // TODO: Remove the students

        dbHelper.getClass(selectedClass)
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
          return generateOptionElements('student', optionObjects)
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

  // === populate the studentSelectPages from the current studentSelectModel
  const updateStudentSelectDisplay = ()=>{

    let selectState = studentSelectModel.getSelectedOptions();

    // if no class selected - show the classes
    if(selectState.class == undefined){
      fillOptions({fillPage:'class'})
      showStudentSelectPage('class')
    }else if(selectState.lesson == undefined){
      // no lesson selected - show the lessons
      fillOptions({fillPage: 'lesson', selectedClass: selectState.class})
      showStudentSelectPage('lesson')
    }else{
      // students are selected - show the students
      fillOptions({fillPage: 'student', selectedClass: selectState.class})
      showStudentSelectPage('student')
    }

  }



  //    ==   IMPLEMENTATION DETAILS    == 


 // if there are media devices to pull from and the interface available in browser
  if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
    console.log('getUserMedia supported');
    
    // get the stream to listen to
    navigator.mediaDevices.getUserMedia({ audio:true }) // only audio needed for this app
    // attach the stream to the recorder
    .then((stream)=>{
      mediaRecorder = createRecorder(stream);
    })
    // populate the database
    .then(()=>{
      console.log(dbHelper)
      console.log("do we have a dbHelper?")
    })
    // fill the students list
    .then(()=>{

    })
    // add events to the recorder buttons
    .then(()=>{
        
      // record button clicking
      record.onclick = ()=>{
        mediaRecorder.start();
        console.log(mediaRecorder.state);
        console.log(`recorder started`);
        mainControls.classList.add('recording');
      }

        // stop button clicking
      stop.onclick = ()=>{
        mediaRecorder.stop();
        console.log(mediaRecorder.state)
        console.log("recorder stopped")
        mainControls.classList.remove('recording');
      }
    })
    // error handler
    .catch((err)=>{
      console.log(`The following getUserMedia error occured: ${err}`)
    })
  }else{
      console.log(`getUserMedia not supported on your browser`)
  }

  // event listener on the student select title
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

  // event listener to expand the student select if necessary
  studentSelect.addEventListener('click',()=>{
    if(studentSelect.classList.contains('active')){
      studentSelect.classList.remove('active')
    }else{
      studentSelect.classList.add('active')
    }
  })

  // display the current student select list
  updateStudentSelectDisplay();


  return {
    dbHelper,
    generateStudents,
    generateOptionElements,
    studentSelectModel,
    fillOptions,
    updateStudentSelectDisplay
  }
}();