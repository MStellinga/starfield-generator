export const GENERATE_STARS=0;
export const GENERATE_NEBULA=1;
export const GENERATE_FRACTAL=2;

var settings;
var nebulaBubbleBaseSize = 30;
var nebulaBubbleMaxSize = 160;
var nebulaBubbleCenterBaseSize = 80;
var nebulaBubbleCenterMaxSize = 30;
var colorDistanceFalloff = 2;
var colorDampening = 4;
var fractalDivisionCount = 6;
var fractalMinSize = 5;
var fractalColorGain = 10;

var starClusters = [
    {x: -1, y: -1,   strength: 0, r: 255, g: 255, b:255, size1stars:2000, size2stars:100, size3stars:50, bubbles:0, generated:0, fractalSize: 0 },
    {x: 80, y: 50,   strength: 100, r: 0, g: 200, b:50, size1stars:500, size2stars:50, size3stars:10, bubbles:500, generated:0, fractalSize: 0 },
    {x: 350, y: 250, strength: 30, r: 0, g: 150, b:200, size1stars:500, size2stars:50, size3stars:10, bubbles:500, generated:0, fractalSize: 0 },
    {x: 600, y: 320, strength: 300, r: 0, g: 0, b:250, size1stars:500, size2stars:50, size3stars:10, bubbles:500, generated:0, fractalSize: 0 },
    {x: 400, y: 200, strength: 300, r: 180, g: 0, b:180, size1stars:0, size2stars:0, size3stars:0, bubbles:0, generated:0, fractalSize: 100 },
];

var starPixels;
var nebulaPixels;
var fractalPixels;
var fieldWidth;
var fieldHeight;
var fractalAngles;
var fractalItems = [];

var totalBubbles = 0;
var totalBubblesLog = 0;
var precision = 0.1;

function setPixel(pixels, x, y, r, g, b){    
  x = Math.round(x);
  y = Math.round(y);
  if(x<0 || x >= fieldWidth || y<0 || y >= fieldHeight){
    return;
  }
  
  let idx = (y * fieldWidth * 4) + (x * 4);         
  pixels[idx] = pixels[idx] + r;
  pixels[idx+1] = pixels[idx+1] + g;
  pixels[idx+2] = pixels[idx+2] + b;
}

export function paint(context){    
  let imageData = context.createImageData(fieldWidth, fieldHeight);
  for(let i=0; i<imageData.data.length; i+=4){    
    let valR = starPixels && starPixels[i] ? starPixels[i] : 0;
    valR = nebulaPixels && nebulaPixels[i] ? valR + nebulaPixels[i] : valR;        
    valR = fractalPixels && fractalPixels[i] ? valR + fractalPixels[i] : valR;            
    let valG = starPixels && starPixels[i+1] ? starPixels[i+1] : 0;
    valG = nebulaPixels && nebulaPixels[i+1] ? valG + nebulaPixels[i+1] : valG;        
    valG = fractalPixels && fractalPixels[i+1] ? valG + fractalPixels[i+1] : valG;            
    let valB = starPixels && starPixels[i+2] ? starPixels[i+2] : 0;
    valB = nebulaPixels && nebulaPixels[i+2] ? valB + nebulaPixels[i+2] : valB;        
    valB = fractalPixels && fractalPixels[i+2] ? valB + fractalPixels[i+2] : valB;    
    // Handle blooming 
    // if(valR>255) {
    //   valG += (valR-255)/10;
    //   valB += (valR-255)/10;
    // }
    // if(valG>255) {
    //   valR += (valG-255)/10;
    //   valB += (valG-255)/10;
    // }
    // if(valB>255) {
    //   valR += (valB-255)/10;
    //   valG += (valB-255)/10;
    // }
    // Now paint that sucker
    imageData.data[i] = valR > 255 ? 255 : Math.round(valR);    
    imageData.data[i+1] = valG > 255 ? 255 : Math.round(valG);
    imageData.data[i+2] = valB > 255 ? 255 : Math.round(valB);
    imageData.data[i+3] = 255;
  }  
  context.putImageData(imageData,0,0);  
}

function generateClusterLocation(clusterIdx){
  if(clusterIdx == -1){
    return {
      x: Math.random() * fieldWidth,
      y: Math.random() * fieldHeight
    };
  } else {
    let len = starClusters[clusterIdx].strength + Math.max(fieldWidth/8,fieldHeight/8);
    let distance = len - (Math.random() * (0.9+0.1*Math.random()) * len);    
    let angle = Math.random() * Math.PI * 2;   
    return {
      x: starClusters[clusterIdx].x + distance*Math.cos(angle), 
      y: starClusters[clusterIdx].y + distance*Math.sin(angle) 
    };    
  }
}

function createStar(starSize, clusterIdx) {  
  let pnt = generateClusterLocation(clusterIdx);
  let brightness = Math.random();  
  let r1 = brightness * starClusters[0].r;
  let g1 = brightness * starClusters[0].g;
  let b1 = brightness * starClusters[0].b;
  let r2 = r1/2, g2=g1/2, b2=b1/2;
  let r4 = r1/4, g4=g1/4, b4=b1/4;
  setPixel(starPixels,pnt.x,pnt.y,r1,g1,b1,true);
  if(starSize == 2){
    setPixel(starPixels,pnt.x-1,pnt.y,r2,g2,b2);
    setPixel(starPixels,pnt.x+1,pnt.y,r2,g2,b2);
    setPixel(starPixels,pnt.x,pnt.y-1,r2,g2,b2);
    setPixel(starPixels,pnt.x,pnt.y+1,r2,g2,b2);
    setPixel(starPixels,pnt.x-1,pnt.y-1,r4,g4,b4);
    setPixel(starPixels,pnt.x+1,pnt.y-1,r4,g4,b4);
    setPixel(starPixels,pnt.x-1,pnt.y+1,r4,g4,b4);
    setPixel(starPixels,pnt.x+1,pnt.y+1,r4,g4,b4);
  } else if(starSize == 3){
    setPixel(starPixels,pnt.x-1,pnt.y,r1,g1,b1);
    setPixel(starPixels,pnt.x+1,pnt.y,r1,g1,b1);
    setPixel(starPixels,pnt.x,pnt.y-1,r1,g1,b1);
    setPixel(starPixels,pnt.x,pnt.y+1,r1,g1,b1);
    setPixel(starPixels,pnt.x-2,pnt.y,r2,g2,b2);
    setPixel(starPixels,pnt.x+2,pnt.y,r2,g2,b2);
    setPixel(starPixels,pnt.x,pnt.y-2,r2,g2,b2);
    setPixel(starPixels,pnt.x,pnt.y+2,r2,g2,b2);
    setPixel(starPixels,pnt.x-1,pnt.y-1,r2,g2,b2);
    setPixel(starPixels,pnt.x+1,pnt.y-1,r2,g2,b2);
    setPixel(starPixels,pnt.x-1,pnt.y+1,r2,g2,b2);
    setPixel(starPixels,pnt.x+1,pnt.y+1,r2,g2,b2);
    setPixel(starPixels,pnt.x-2,pnt.y-1,r4,g4,b4);
    setPixel(starPixels,pnt.x+2,pnt.y-1,r4,g4,b4);
    setPixel(starPixels,pnt.x-2,pnt.y+1,r4,g4,b4);
    setPixel(starPixels,pnt.x+2,pnt.y+1,r4,g4,b4);
    setPixel(starPixels,pnt.x-1,pnt.y-2,r4,g4,b4);
    setPixel(starPixels,pnt.x+1,pnt.y-2,r4,g4,b4);
    setPixel(starPixels,pnt.x-1,pnt.y+2,r4,g4,b4);
    setPixel(starPixels,pnt.x+1,pnt.y+2,r4,g4,b4);
  }
}

function createNebulaBubble(clusterIdx) {  
  let center = generateClusterLocation(clusterIdx);
  let size = nebulaBubbleBaseSize + Math.random() * (nebulaBubbleMaxSize-nebulaBubbleBaseSize);
  let centerSize = nebulaBubbleCenterBaseSize + Math.random() * (nebulaBubbleCenterMaxSize-nebulaBubbleCenterBaseSize);
  if(centerSize > size) {
    let tmp = size;
    size = centerSize;
    centerSize = tmp;
  }
  let color = {r:0,g:0,b:0};
  let total = 0;
  let dists=[];
  for(let j=0;j<starClusters.length; j++) {    
    let val = Math.sqrt(Math.pow(starClusters[j].x-center.x,2) + Math.pow(starClusters[j].y-center.y,2));
    // higher falloff to make more saturated colors around clusters
    dists.push(val*colorDistanceFalloff);
    total += val;
  }
  for(let j=0;j<starClusters.length; j++) {
    let fact =  1.0 - dists[j]/total;
    let fact2 = fact * starClusters[j].bubbles/totalBubbles;
    color.r += starClusters[j].r * fact * fact2;
    color.g += starClusters[j].g * fact * fact2;
    color.b += starClusters[j].b * fact * fact2;
  }
  
  // Add some color randomness and determine strength  
  var clusterStrength = starClusters[clusterIdx].strength / (totalBubblesLog*colorDampening*starClusters[clusterIdx].bubbles);
  let strength = (2 + 0.6 * Math.random()) *  clusterStrength;
  color.r = color.r * strength;
  color.g = color.g * strength;
  color.b = color.b * strength;  

  drawBubble(nebulaPixels, center.x, center.y,color,centerSize, size,[]);
}

function createFractal(clusterIdx){  
  if(starClusters[clusterIdx].fractalSize == 0){
    return;
  }
  fractalAngles = Array(fractalDivisionCount);
  let angle = (2*Math.PI) / fractalDivisionCount;
  for(let i=0; i<fractalAngles.length; i++) {
    fractalAngles[i] = (i * angle )/(2*Math.PI)*10;
  }    
  let strength;
  if(fractalColorGain < 0){
    strength = (50/-fractalColorGain)*Math.log2(starClusters[clusterIdx].fractalSize);
  } else if(fractalColorGain == 0){
    strength = 5*Math.log2(starClusters[clusterIdx].fractalSize);
  } else {
    strength = 5*fractalColorGain*Math.log2(starClusters[clusterIdx].fractalSize);
  }
  let color = {
    r: Math.abs(starClusters[clusterIdx].r / strength) ,
    g: Math.abs(starClusters[clusterIdx].g / strength),
    b: Math.abs(starClusters[clusterIdx].b / strength)
  }
  fractalItems.push({      
      x: starClusters[clusterIdx].x,
      y: starClusters[clusterIdx].y,      
      size: starClusters[clusterIdx].fractalSize,
      color: color
    }
  );
}

function drawFractal(x, y, size, color) {       
  var edgePositionsForAngles = drawBubble(fractalPixels, x, y, color, size * 0.8, size, fractalAngles);
  if(size > fractalMinSize) {        
    let color2 = {
      r: color.r * (100+fractalColorGain)/100,
      g: color.g * (100+fractalColorGain)/100,
      b: color.b * (100+fractalColorGain)/100
    }        
    for(let i=0; i < edgePositionsForAngles.length; i++) {
      if(edgePositionsForAngles[i].x != -1 && edgePositionsForAngles[i].y != -1) {      
        fractalItems.push({
          x: edgePositionsForAngles[i].x, 
          y:edgePositionsForAngles[i].y,
          size:  size*Math.random()*0.9,
          color: color2
        })
      }
    }
  }
}

function nextFractalItem() {
  var item = fractalItems.pop();  
  if(item){
    drawFractal(item.x, item.y, item.size, item.color);
  }
}

function drawBubble(pixels, centerX, centerY, color, innerSize, outerSize, rimAngles){
  // Determine max affected area
  let xMin = Math.floor(Math.max(0,centerX - outerSize));
  let xMax = Math.floor(Math.min(fieldWidth,centerX + outerSize));
  let yMin = Math.floor(Math.max(0,centerY- outerSize));
  let yMax = Math.floor(Math.min(fieldHeight,centerY + outerSize));
  
  // Divide the circle into slices (of pie) with a slightly different size
  let distancePerAngle = [];
  for(let i=0;i<10;i++){
    distancePerAngle.push(0.8 + Math.random()*0.2);
  }
  
  var pointsOnRim = Array(rimAngles.length);
  for(var i=0; i<rimAngles.length; i++){
    pointsOnRim[i] = {x:-1,y:-1,dist: 0}
  }  
  // Now draw the bubble
  for(let x=xMin; x<xMax; x++) {
    for(let y=yMin; y<yMax; y++) {   
      let angle = (Math.atan2(centerX-x, centerY-y) + Math.PI)/(2*Math.PI)*10; // -PI to PI
      let angleIdx = Math.floor(angle);
      let anglePart = angle - angleIdx  > 0 ? angle - angleIdx : angle - angleIdx + 1;
      angleIdx = angleIdx>9 ? angleIdx = 0 : angleIdx; // remove 2PI case    
      let distToCenter = Math.sqrt(Math.pow(centerX-x,2) + Math.pow(centerY-y,2));
      let sizeMod = determineSizeModifier(distancePerAngle, angleIdx, anglePart);      
      if(distToCenter >= (outerSize*sizeMod)){        
        continue;
      } 
      let randomPart = 1-(Math.random()/5);      
      let sizePart = (distToCenter >= (innerSize*sizeMod)) ? 1 : distToCenter/(innerSize*sizeMod);
      let interpolatedColor= {
        r: color.r * sizePart * randomPart,
        g: color.g * sizePart * randomPart,
        b: color.b * sizePart * randomPart
      };            

      for(let j=0; j<rimAngles.length; j++) {        
        if( Math.abs(angle - rimAngles[j]) <= precision){
          if(!pointsOnRim[j] || pointsOnRim[j].dist <distToCenter) {
            pointsOnRim[j].x = x;
            pointsOnRim[j].y = y;
            pointsOnRim[j].dist = distToCenter;
          }
        }
      }

      setPixel(pixels,x,y,interpolatedColor.r, interpolatedColor.g , interpolatedColor.b);
    }
  }
  return pointsOnRim;
}

function determineSizeModifier(distancePerAngle, angleIdx, anglePart) {
  let result;
  if(anglePart > 0.5) {
    let nextIdx = (angleIdx + 1) > 9 ? 0 : (angleIdx + 1);                
    result = distancePerAngle[angleIdx] * (1.5-anglePart) + distancePerAngle[nextIdx] * (anglePart-0.5);
  } else if(anglePart < 0.5){
    let prevIdx = (angleIdx - 1) < 0 ? 9 : (angleIdx - 1);          
    result = distancePerAngle[prevIdx] * (0.5-anglePart) + distancePerAngle[angleIdx] * (0.5+anglePart);    
  } else {
    result = distancePerAngle[angleIdx];
  }  
  return result;
}

function getClusterTotalToGenerate(clusterIdx, mode){
  if(mode == GENERATE_NEBULA){
    return starClusters[clusterIdx].bubbles;
  } else if(mode == GENERATE_FRACTAL) {    
    if(starClusters[clusterIdx].fractalSize-fractalMinSize > 0){
      return 2.5 * Math.pow(fractalDivisionCount, Math.log2(starClusters[clusterIdx].fractalSize-fractalMinSize));    
    } else {
      return 0;
    }
  } else {
    return starClusters[clusterIdx].size1stars + starClusters[clusterIdx].size2stars + starClusters[clusterIdx].size3stars;
  }
}

function getTotalToGenerate(mode){
  let result = 0;
  for(let i=0; i<starClusters.length; i++){
    result += getClusterTotalToGenerate(i, mode);
  }
  return result;
}

function getGenerated(){
  let result = 0;
  for(let i=0; i<starClusters.length; i++){
    result += starClusters[i].generated;
  }
  return result;
}

export function getProgress(mode){
  let total = getTotalToGenerate(mode);
  let done = getGenerated();
  return (100*done) / total;
}

function resetGenerated(){
  for(let i=0; i<starClusters.length; i++){
    starClusters[i].generated = 0;
  }
}

export function getClusters() {
  return starClusters;
}

export function setClusterColor(idx, color){
  let rgb = color.toRGBA();
  starClusters[idx].r =rgb[0];
  starClusters[idx].g =rgb[1];
  starClusters[idx].b =rgb[2];
}

export function addNewCluster(x,y){
  starClusters.push({
    x: x, y: y,
    strength: 50, r: 255, g: 255, b:255, 
    size1stars:300, size2stars:50, size3stars:0, bubbles:200, generated:0, fractalSize: 0
  });
}

export function generate(clusterIdx, mode, amount){    
  let idx = clusterIdx;        
  let notDone = (fractalItems.length > 0) ||  (starClusters[idx].generated < getClusterTotalToGenerate(clusterIdx, mode));    
  for(let i=0; i < amount && notDone; i++) {
    if(mode == GENERATE_NEBULA){      
      createNebulaBubble(clusterIdx);
    } else if(mode == GENERATE_FRACTAL) {
      nextFractalItem();
    } else {
      let starSize = 1;
      if(starClusters[idx].generated >= starClusters[idx].size1stars) {
        if(starClusters[idx].generated >= starClusters[idx].size1stars + starClusters[idx].size2stars) {
          starSize = 3;
        } else {
          starSize = 2;
        }
      }
      createStar(starSize, idx == 0 ? -1 : idx);
    }
    starClusters[idx].generated++;
    notDone = (fractalItems.length > 0) ||  (starClusters[idx].generated < getClusterTotalToGenerate(clusterIdx, mode));
  }
  return notDone;  
}

export function init(settingsFromUI, mode, width, height){
  fieldWidth = width;
  fieldHeight = height;
  settings = settingsFromUI;
  nebulaBubbleBaseSize = settingsFromUI.nebulaBubbleBaseSize;
  nebulaBubbleMaxSize = settingsFromUI.nebulaBubbleMaxSize;
  nebulaBubbleCenterBaseSize = settingsFromUI.nebulaCenterBaseSize;
  nebulaBubbleCenterMaxSize= settingsFromUI.nebulaCenterMaxSize;  
  colorDistanceFalloff = settingsFromUI.colorDistanceFalloff;
  colorDampening = settingsFromUI.colorDampening;
  fractalDivisionCount = settingsFromUI.fractalDivisionCount;
  fractalMinSize = settingsFromUI.fractalMinSize;
  fractalColorGain = settingsFromUI.fractalColorGain;

  resetGenerated();
  totalBubbles = 0;
  for(var i=0; i<starClusters.length; i++) {
    totalBubbles += starClusters[i].bubbles;
  }
  totalBubblesLog = Math.log2(totalBubbles);
  if(mode == GENERATE_NEBULA){        
    nebulaPixels = new Array(width*height*4);
    for(let i=0; i<nebulaPixels.length; i+=4){
      nebulaPixels[i]=nebulaPixels[i+1]=nebulaPixels[i+2]=0;
      nebulaPixels[i+3]=255;
    }
  } else if(mode == GENERATE_FRACTAL){
    fractalPixels = new Array(width*height*4);    
    for(let i=0; i<fractalPixels.length; i+=4){
      fractalPixels[i]=fractalPixels[i+1]=fractalPixels[i+2]=0;
      fractalPixels[i+3]=255;
    }
    for(var i=0; i<starClusters.length; i++) {
      createFractal(i);
    }
  } else {    
    starPixels = new Array(width*height*4);    
    for(let i=0; i<starPixels.length; i+=4){
      starPixels[i]=starPixels[i+1]=starPixels[i+2]=0;
      starPixels[i+3]=255;
    }
  }
}