import { init, generate,getClusters,getProgress, paint} from '../generator/generator.js';

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
  if(idx<getClusters().length) {
    var notDone = generate(idx, nebula, batchSize);   

    progressDiv.style.width = "" + getProgress(nebula)+ "%";
    if(notDone){
      setTimeout(()=>{doGenerate(idx, nebula)},0);
    } else {
      setTimeout(()=>{doGenerate(idx+1, nebula)},0);
    }
  } else{    
    paint();            
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
    settings[0] = getAsInt('nebula-color-variation',5);
    settings[1] = getAsInt('nebula-bubble-base-size',30);
    settings[2] = getAsInt('nebula-bubble-max-size',160);
    settings[3] = getAsInt('nebula-push-base-size',80);
    settings[4] = getAsInt('nebula-push-max-size',30);
    init(settings, nebula, ctx,width,height);
  }
  
  export function generateStars(){
    initVars(false);    
        
    doGenerate(0, false);    
  }
  
  export function generateNebula(){
    initVars(true);    
        
    doGenerate(0, true);    
  }