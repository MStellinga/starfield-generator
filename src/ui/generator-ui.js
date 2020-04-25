import { init, generate, getClusters,getProgress, applyBlur, paint, GENERATE_FRACTAL, GENERATE_NEBULA, GENERATE_STARS} from '../generator/generator.js';

var canvas;
var width;
var height;

var batchSize = 10;
var generating = false;
var canceled = false;

function getAsInt(elementId, fallback){
  let result = parseInt(document.getElementById(elementId).value);
  if(isNaN(result)){
      document.getElementById(elementId).value = fallback;
      result = fallback;
  }
  return result;
}

function getAsBool(elementId){
  let box = document.getElementById(elementId);  
  return box.checked;
}

function getAsFloat(elementId, fallback){
  let result = parseFloat(document.getElementById(elementId).value);
  if(isNaN(result)){
      document.getElementById(elementId).value = fallback;
      result = fallback;
  }
  return result;
}

function doGenerate(idx, mode) {  
  let progressDiv = document.getElementById('progress-done');  
  document.getElementById('button-generate-stars').style.display = 'none';
  document.getElementById('button-generate-nebula').style.display = 'none';
  document.getElementById('button-generate-fractal').style.display = 'none';
  document.getElementById('button-generate-cancel').style.display = '';  
  let clusterCount = getClusters().length;
  if(idx < clusterCount) {
    let notDone = generate(idx, mode, batchSize);   

    let progress = getProgress(mode);
    if(progress>99){
      progress = 100;
    }
    progressDiv.style.width = "" + progress + "%";            
    if(!canceled && notDone){
      setTimeout(()=>{doGenerate(idx, mode)},0);
    } else if(!canceled && idx + 1 < clusterCount) {      
       setTimeout(()=>{doGenerate(idx+1, mode)},0);    
    } else {          
      console.log(canceled ? 'Canceled' : 'Done');
      applyBlur(mode);            
      paint(canvas.getContext("2d"));      
      progressDiv.style.width = "0%";
      generating = false;
      document.getElementById('button-generate-stars').style.display = '';
      document.getElementById('button-generate-nebula').style.display = '';
      document.getElementById('button-generate-fractal').style.display = '';
      document.getElementById('button-generate-cancel').style.display = 'none';
    }
  } 
}

function initVariables(mode){
  generating = true;
  canceled = false;
  canvas = document.getElementById("star-canvas");
  width = canvas.clientWidth;
  height = canvas.clientHeight;  
  console.log("Generate "+width + "x"+height);
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,width,height);    
  let settings = {    
    nebulaBubbleBaseSize: getAsInt('nebula-bubble-base-size',30),
    nebulaBubbleMaxSize: getAsInt('nebula-bubble-max-size',160),
    nebulaBubbleCenterBaseSize: getAsInt('nebula-push-base-size',80),
    nebulaBubbleCenterMaxSize: getAsInt('nebula-push-max-size',30),
    colorDistanceFalloff: getAsFloat('color-distance-falloff',2),
    colorDampening: getAsFloat('color-dampening',4),
    fractalDivisionCount: getAsInt('fractal-division-count',6),
    fractalMinSize: getAsInt('fractal-minsize',5),
    fractalColorGain: getAsInt('fractal-color-gain',10),
    blurNebula: getAsBool('blur-nebula-checkbox'),
    blurFractal: getAsBool('blur-fractal-checkbox'),
    blueStars: false
  }  
  init(settings, mode, width, height);
}
  
export function generateStars(){
  if(generating){
    return;
  }
  initVariables(GENERATE_STARS);            
  doGenerate(0, GENERATE_STARS);    
}

export function generateNebula(){
  if(generating){
    return;
  }
  initVariables(GENERATE_NEBULA);            
  doGenerate(0, GENERATE_NEBULA);    
}

export function generateFractal(){
  if(generating){
    return;
  }  
  initVariables(GENERATE_FRACTAL);            
  doGenerate(0, GENERATE_FRACTAL);    
}

export function cancelGenerate(){
  canceled = true;
}