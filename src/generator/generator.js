var nebulaBubbleBaseSize = 30;
var nebulaBubbleMaxSize = 160;
var nebulaBubbleCenterBaseSize = 80;
var nebulaBubbleCenterMaxSize = 30;
var colorDistanceFalloff = 2;

var starClusters = [
    {x: -1, y: -1,   strength: 0, r: 255, g: 255, b:255, size1stars:2000, size2stars:100, size3stars:50, bubbles:500, generated:0 },
    {x: 80, y: 50,   strength: 30, r: 0, g: 200, b:50, size1stars:500, size2stars:50, size3stars:10, bubbles:500, generated:0 },
    {x: 350, y: 250, strength: 30, r: 0, g: 150, b:200, size1stars:500, size2stars:50, size3stars:10, bubbles:500, generated:0 },
    {x: 600, y: 320, strength: 40, r: 0, g: 0, b:250, size1stars:500, size2stars:50, size3stars:10, bubbles:500, generated:0 },
];

var starPixels;
var nebulaPixels;
var fieldWidth;
var fieldHeight;

var total = 0;

function setPixel(pixels, x, y, r, g, b){    
  let n1 = new Date().getTime();
  x = Math.round(x);
  y = Math.round(y);
  if(x<0 || x >= fieldWidth || y<0 || y >= fieldHeight){
    return;
  }
  
  let idx = (y * fieldWidth * 4) + (x * 4);         
  pixels[idx] = pixels[idx] + r;
  pixels[idx+1] = pixels[idx+1] + g;
  pixels[idx+2] = pixels[idx+2] + b;
  total += new Date().getTime() - n1;
}

export function paint(context){    
  let imageData = context.createImageData(fieldWidth, fieldHeight);
  for(let i=0; i<imageData.data.length; i++){    
    let val = starPixels && starPixels[i] ? starPixels[i] : 0;
    val = nebulaPixels && nebulaPixels[i] ? val + nebulaPixels[i] : val;        
    imageData.data[i] = val > 255 ? 255 : Math.round(val);
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
    let len = starClusters[clusterIdx].strength + Math.max(fieldWidth/2,fieldHeight/2);
    let distance = Math.random() * (0.2+0.8*Math.random()) * len;    
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
    color.r += starClusters[j].r * fact;
    color.g += starClusters[j].g * fact;
    color.b += starClusters[j].b * fact;
  }
  
  // Add some color randomness and determine strength
  let strength = (starClusters[clusterIdx].strength * Math.random()) / (15*starClusters[clusterIdx].bubbles);
  color.r = color.r * strength;
  color.g = color.g * strength;
  color.b = color.b * strength;  
  // Determine max affected area
  let xMin = Math.floor(Math.max(0,center.x - size));
  let xMax = Math.floor(Math.min(fieldWidth,center.x + size));
  let yMin = Math.floor(Math.max(0,center.y - size));
  let yMax = Math.floor(Math.min(fieldHeight,center.y + size));
  
  let distancePerAngle = [];
  for(let i=0;i<10;i++){
    distancePerAngle.push(0.8 + Math.random()*0.2);
  }

  for(let x=xMin; x<xMax; x++) {
    for(let y=yMin; y<yMax; y++) {   
      let angle = (Math.atan2(center.x-x, center.y-y) + Math.PI)/(2*Math.PI)*10; // -PI to PI
      let angleIdx = Math.floor(angle);
      let anglePart = angle - angleIdx  > 0 ? angle - angleIdx : angle - angleIdx + 1;
      angleIdx = angleIdx>9 ? angleIdx = 0 : angleIdx; // remove 2PI case    
      let distToCenter = Math.sqrt(Math.pow(center.x-x,2) + Math.pow(center.y-y,2));
      let sizeMod = determineSizeModifier(distancePerAngle, angleIdx, anglePart);      
      if(distToCenter >= (size*sizeMod)){
        continue;
      } 
      let interpolatedColor;     
      if(distToCenter >= (centerSize*sizeMod)) {
        interpolatedColor = color;                          
      } else {
        interpolatedColor = interpolateColors({r:0,g:0,b:0}, color, distToCenter/(centerSize*sizeMod));                
      }
      // Add noise
      interpolatedColor = interpolateColors(interpolatedColor,{r:0,g:0,b:0}, Math.random()/5);                
      setPixel(nebulaPixels,x,y,interpolatedColor.r, interpolatedColor.g , interpolatedColor.b);
    }
  }
}

function determineSizeModifier(distancePerAngle, angleIdx, anglePart) {
  let result;
  if(anglePart > 0.5) {
    let nextIdx = (angleIdx + 1) > 9 ? 0 : (angleIdx + 1);                
    result = distancePerAngle[angleIdx] * (1.5-anglePart) + distancePerAngle[nextIdx] * (anglePart-0.5);
    //console.log(""+angleIdx+"|"+anglePart+"> " + distancePerAngle[angleIdx] + "|"+distancePerAngle[nextIdx]+"="+result);
  } else if(anglePart < 0.5){
    let prevIdx = (angleIdx - 1) < 0 ? 9 : (angleIdx - 1);          
    result = distancePerAngle[prevIdx] * (0.5-anglePart) + distancePerAngle[angleIdx] * (0.5+anglePart);    
  } else {
    result = distancePerAngle[angleIdx];
  }  
  return result;
}

function interpolateColors(color1, color2, part) {
  let result = {
    r: color1.r * (1.0-part) + color2.r * part,
    g: color1.g * (1.0-part) + color2.g * part,
    b: color1.b * (1.0-part) + color2.b * part
  }
  return result;
}


function getClusterTotalToGenerate(clusterIdx, nebula){
  if(nebula){
    return starClusters[clusterIdx].bubbles;
  } else {
    return starClusters[clusterIdx].size1stars + starClusters[clusterIdx].size2stars + starClusters[clusterIdx].size3stars;
  }
}

function getTotalToGenerate(nebula){
  let result = 0;
  for(let i=0; i<starClusters.length; i++){
    result += getClusterTotalToGenerate(i, nebula);
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

export function getProgress(nebula){
  return (100*getGenerated()) / getTotalToGenerate(nebula);
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
    size1stars:300, size2stars:50, size3stars:0, bubbles:200, generated:0 
  });
}

export function generate(clusterIdx, nebula, amount){  
  let idx = clusterIdx;        
  let notDone = starClusters[idx].generated < getClusterTotalToGenerate(clusterIdx, nebula);    
  for(let i=0; i < amount && notDone; i++) {
    if(nebula){      
      createNebulaBubble(clusterIdx);
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
    notDone = starClusters[idx].generated < getClusterTotalToGenerate(clusterIdx, nebula);
  }
  return notDone;  
}

export function init(settings, nebula, width, height){
  fieldWidth = width;
  fieldHeight = height;
  nebulaBubbleBaseSize = settings.nebulaBubbleBaseSize;
  nebulaBubbleMaxSize = settings.nebulaBubbleMaxSize;
  nebulaBubbleCenterBaseSize = settings.nebulaCenterBaseSize;
  nebulaBubbleCenterMaxSize= settings.nebulaCenterMaxSize;  
  colorDistanceFalloff = settings.colorDistanceFalloff;
  resetGenerated();
  if(nebula){        
    nebulaPixels = new Array(width*height*4);
    for(let i=0; i<nebulaPixels.length; i+=4){
      nebulaPixels[i]=nebulaPixels[i+1]=nebulaPixels[i+2]=0;
      nebulaPixels[i+3]=255;
    }
  } else {    
    starPixels = new Array(width*height*4);    
    for(let i=0; i<starPixels.length; i+=4){
      starPixels[i]=starPixels[i+1]=starPixels[i+2]=0;
      starPixels[i+3]=255;
    }
  }
}