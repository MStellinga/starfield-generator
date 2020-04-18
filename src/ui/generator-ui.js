import { init, generate, getClusters,getProgress, paint} from '../generator/generator.js';

var canvas;
var width;
var height;

var batchSize = 10;


function getAsInt(elementId, fallback){
  var result = parseInt(document.getElementById(elementId).value);
  if(isNaN(result)){
      document.getElementById(elementId).value = fallback;
      result = fallback;
  }
  return result;
}

function doGenerate(idx, nebula) {  
  var progressDiv = document.getElementById('progress-done');  
  var clusterCount = getClusters().length;
  if(idx < clusterCount) {
    var notDone = generate(idx, nebula, batchSize);   

    var progress = getProgress(nebula);
    progressDiv.style.width = "" + progress + "%";        
    if(notDone){
      setTimeout(()=>{doGenerate(idx, nebula)},0);
    } else if(idx + 1 < clusterCount) {      
        setTimeout(()=>{doGenerate(idx+1, nebula)},0);    
    } else {          
      paint(canvas.getContext("2d"));
      progressDiv.style.width = "0%";
    }
  } 
}

function initVars(nebula){
    canvas = document.getElementById("star-canvas");
    width = canvas.clientWidth;
    height = canvas.clientHeight;  
    console.log("Generate "+width + "x"+height);
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,width,height);    
    var settings = Array();    
    settings[0] = getAsInt('nebula-bubble-base-size',30);
    settings[1] = getAsInt('nebula-bubble-max-size',160);
    settings[2] = getAsInt('nebula-push-base-size',80);
    settings[3] = getAsInt('nebula-push-max-size',30);
    init(settings, nebula,width,height);
  }
  
  export function generateStars(){
    initVars(false);    
        
    doGenerate(0, false);    
  }
  
  export function generateNebula(){
    initVars(true);    
        
    doGenerate(0, true);    
  }