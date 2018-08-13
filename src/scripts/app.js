'use strict';

// tutorial used - https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API
const recorderApp = function RecorderApp(){ 
  var record = document.querySelector('.record');
  var stop = document.querySelector('.stop');
  var soundClips = document.querySelector('.sound-clips');
  var mainControls = document.querySelector('.main-controls')
  var studentSelect = document.querySelector('.student-select');
  var studentSelect_studentList = document.querySelector('.sselect-page.student')
  var studentSelect_title = document.querySelector('.student-select .title')

  var mediaRecorder;
  var chunks = [];
  var dbHelper = new DBHelper();
  dbHelper.populateDatabase()
  
  dbHelper.getClass(2)
  .then((classObject)=>{
    return Promise.all(classObject.attachedStudents.map((studentId)=>{
      return dbHelper.getStudent(studentId);
    }))
  })
  .then( (studentArray)=>{
    generateStudents(studentArray).forEach((element)=>{
      studentSelect_studentList.appendChild(element)
    })
  })
  
  // get the students for a class

  // create the elements



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

  const storeAudioClip = ({
    audioBlob,
    clipName = `audio clip ${new Date}`,
    clipTags = []
  })=>{
    
  }

  const mergeChunks = (audioChunks)=>{
    return newBlob(audioChunks, {'type': 'audio/ogg; codecs=opus'})
  }

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


  // event listeners on elements
  studentSelect_title.addEventListener('click',(event)=>{
    if(!studentSelect.classList.contains('active')){
      event.preventDefault();
      studentSelect.classList.toggle('active')
    }else{
      // move to previous page
    }
  })



  return {
    dbHelper,
    generateStudents
  }
}();