export default class RecordHelper{

  // function to create a stream
  static _getStream(){
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
      
      // get the stream to listen to
      return navigator.mediaDevices.getUserMedia({ audio:true }) // only audio needed for this app
      .catch((err)=>{
        console.error(`The following getUserMedia error occured: ${err}`)
      })
    }else{
      console.error(`getUserMedia not supported on your browser`)
    }
  }

  // function to create a recorderObject
  static createRecorder(){
    
    return RecordHelper._getStream()
    .then( stream =>{
      let recorder = new MediaRecorder(stream)
      let chunks = [];

      // event listener for each chunk ready
      recorder.ondataavailable = (e)=>{
        chunks.push(e.data)
      }

      // when the recording is done
      recorder.onstop = (e)=>{
        var blob = new Blob(chunks, {'type':'audio/ogg; codexs=opus'});
        console.log(blob)
      }

      return recorder
    })
    
  }
}