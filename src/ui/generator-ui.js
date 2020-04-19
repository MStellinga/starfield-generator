import { init, generate, getClusters,getProgress, paint} from '../generator/generator.js';

var canvas;
var width;
var height;

var batchSize = 10;
var generating = false;

function getAsInt(elementId, fallback){
  let result = parseInt(document.getElementById(elementId).value);
  if(isNaN(result)){
      document.getElementById(elementId).value = fallback;
      result = fallback;
  }
  return result;
}

function getAsFloat(elementId, fallback){
  let result = parseFloat(document.getElementById(elementId).value);
  if(isNaN(result)){
      document.getElementById(elementId).value = fallback;
      result = fallback;
  }
  return result;
}

function doGenerate(idx, nebula) {  
  let progressDiv = document.getElementById('progress-done');  
  let clusterCount = getClusters().length;
  if(idx < clusterCount) {
    let notDone = generate(idx, nebula, batchSize);   

    let progress = getProgress(nebula);
    progressDiv.style.width = "" + progress + "%";        
    if(notDone){
      setTimeout(()=>{doGenerate(idx, nebula)},0);
    } else if(idx + 1 < clusterCount) {      
        setTimeout(()=>{doGenerate(idx+1, nebula)},0);    
    } else {          
      paint(canvas.getContext("2d"));      
      progressDiv.style.width = "0%";
      generating = false;
    }
  } 
}

function initVariables(nebula){
  canvas = document.getElementById("star-canvas");
  width = canvas.clientWidth;
  height = canvas.clientHeight;  
  console.log("Generate "+width + "x"+height);
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,width,height);    
  let settings = {    
    nebulaBubbleBaseSize: getAsInt('nebula-bubble-base-size',30),
    nebulaBubbleMaxSize: getAsInt('nebula-bubble-max-size',160),
    nebulaCenterBaseSize: getAsInt('nebula-push-base-size',80),
    nebulaCenterMaxSize: getAsInt('nebula-push-max-size',30),
    colorDistanceFalloff: getAsFloat('color-distance-falloff',2),
    colorDampening: getAsFloat('color-dampening',4)
  }
  init(settings, nebula,width,height);
}
  
export function generateStars(){
  if(generating){
    return;
  }
  generating = true;
  initVariables(false);            
  doGenerate(0, false);    
}

export function generateNebula(){
  if(generating){
    return;
  }
  generating = true;
  initVariables(true);            
  doGenerate(0, true);    
}