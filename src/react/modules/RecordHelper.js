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
  static createRecorder( storeDataCallback = ()=>{console.log("storing some data")} ){
    
    return RecordHelper._getStream()
    .then( stream =>{
      let recorder = new MediaRecorder(stream)

      // event listener for each chunk ready
      recorder.ondataavailable = (e)=>{
        storeDataCallback(e.data)
      }

      return recorder
    })
    
  }
}