
var nebulaColorVariation = 5;
var nebulaBubbleBaseSize = 30;
var nebulaBubbleMaxSize = 160;
var nebulaBubbleBasePushDistance = 80;
var nebulaBubbleMaxPushDistance = 30;

var starClusters = [
    {x: -1, y: -1,   strength: 0, r: 255, g: 255, b:255, size1stars:2000, size2stars:100, size3stars:0, bubbles:100, generated:0 },
    {x: 80, y: 50,   strength: 30, r: 0, g: 105, b:50, size1stars:500, size2stars:50, size3stars:0, bubbles:500, generated:0 },
    {x: 205, y: 200, strength: 80, r: 0, g: 50, b:200, size1stars:500, size2stars:50, size3stars:0, bubbles:500, generated:0 },
    {x: 420, y: 290, strength: 30, r: 0, g: 100, b:100, size1stars:500, size2stars:50, size3stars:0, bubbles:500, generated:0 },
    {x: 600, y: 320, strength: 150, r: 0, g: 0, b:250, size1stars:500, size2stars:50, size3stars:0, bubbles:500, generated:0 },
];

var ctx;
var pixelData;
var starPixels;
var nebulaPixels;
var tmpPixels;
var width;
var height;

export function initStarPixels(wdt, hgt){
  width = wdt;
  height = hgt;
  starPixels = new Array(width);
  tmpPixels = new Array(width);
  for(var x=0; x<starPixels.length;x++){
    starPixels[x] = new Array(height);
    tmpPixels[x] = new Array(height);
    for(var y=0; y<height; y++) {
      starPixels[x][y] = {r:0,g:0,b:0};
      tmpPixels[x][y] = {r:0,g:0,b:0};
    }
  }
}
export function initNebulaPixels(wdt, hgt){
  width = wdt;
  height = hgt;
  nebulaPixels = new Array(width);
  tmpPixels = new Array(width);
  for(var x=0; x<nebulaPixels.length;x++){
    nebulaPixels[x] = new Array(height);
    tmpPixels[x] = new Array(height);
    for(var y=0; y<height; y++) {
      nebulaPixels[x][y] = {r:0,g:0,b:0};
      tmpPixels[x][y] = {r:0,g:0,b:0};
    }
  }
}

function setPixel(pixels, x, y, r, g, b){
  x = Math.round(x);
  y = Math.round(y);
  if(x<0 || x >= pixels.length){
    return;
  }
  if(y<0 || y >= pixels[x].length){
    return;
  }
  var r1 = pixels[x][y].r + r;
  var g1 = pixels[x][y].g + g;
  var b1 = pixels[x][y].b + b;
  pixels[x][y] = {r:r1,g:g1,b:b1};
}

export function paint(){
  if(starPixels) {
    for(var x=0; x<starPixels.length; x++) {
      for(var y=0; y<starPixels[x].length; y++) {        
        tmpPixels[x][y].r = starPixels[x][y] ? starPixels[x][y].r : 0;
        tmpPixels[x][y].g = starPixels[x][y] ? starPixels[x][y].g : 0;
        tmpPixels[x][y].b = starPixels[x][y] ? starPixels[x][y].b : 0;        
      }
    }
  }
  if(nebulaPixels){
    for(var x=0; x<nebulaPixels.length; x++) {
      for(var y=0; y<nebulaPixels[x].length; y++) {
        if(!nebulaPixels[x][y])
          continue;
        tmpPixels[x][y].r = tmpPixels[x][y].r + nebulaPixels[x][y].r;
        if(tmpPixels[x][y].r >255 ){
          tmpPixels[x][y].r = 255;
        } 
        tmpPixels[x][y].g = tmpPixels[x][y].g + nebulaPixels[x][y].g;
        if(tmpPixels[x][y].g >255 ){
          tmpPixels[x][y].g = 255;
        } 
        tmpPixels[x][y].b = tmpPixels[x][y].b + nebulaPixels[x][y].b;
        if(tmpPixels[x][y].b >255 ){
          tmpPixels[x][y].b = 255;
        } 
      }
    }    
  }
  var d  = pixelData.data;
  for(var i=0; i<tmpPixels.length; i++) {
    for(var j=0; j<tmpPixels[i].length; j++) {      
      d[0]   = tmpPixels[i][j].r;
      d[1]   = tmpPixels[i][j].g;
      d[2]   = tmpPixels[i][j].b;
      d[3]   = 255;
      ctx.putImageData( pixelData, i, j);
    }
  }
}

function generateClusterLocation(clusterIdx){
  if(clusterIdx == -1){
    return {
      x: Math.random() * width,
      y: Math.random() * height
    };
  } else {
    var len = starClusters[clusterIdx].strength + Math.max(width/2,height/2);
    var distance = Math.random() * (0.2+0.8*Math.random()) * len;    
    var angle = Math.random() * Math.PI * 2;   
    return {
      x: starClusters[clusterIdx].x + distance*Math.cos(angle), 
      y: starClusters[clusterIdx].y + distance*Math.sin(angle) 
    };    
  }
}

function createStar(starSize, clusterIdx) {  
  var pnt = generateClusterLocation(clusterIdx);
  var brightness = Math.random() * 255;
  setPixel(starPixels,pnt.x,pnt.y,brightness,brightness,brightness,true);
  // TODO starSize 3  
  if(starSize >= 2){
    setPixel(starPixels,pnt.x-1,pnt.y,brightness/2,brightness/2,brightness/2);
    setPixel(starPixels,pnt.x+1,pnt.y,brightness/2,brightness/2,brightness/2);
    setPixel(starPixels,pnt.x,pnt.y-1,brightness/2,brightness/2,brightness/2);
    setPixel(starPixels,pnt.x,pnt.y+1,brightness/2,brightness/2,brightness/2);
    setPixel(starPixels,pnt.x-1,pnt.y-1,brightness/4,brightness/4,brightness/4);
    setPixel(starPixels,pnt.x+1,pnt.y-1,brightness/4,brightness/4,brightness/4);
    setPixel(starPixels,pnt.x-1,pnt.y+1,brightness/4,brightness/4,brightness/4);
    setPixel(starPixels,pnt.x+1,pnt.y+1,brightness/4,brightness/4,brightness/4);
  }
}

function createNebulaBubble(clusterIdx) {  
  var center = generateClusterLocation(clusterIdx);
  var size = nebulaBubbleBaseSize + Math.random() * (nebulaBubbleMaxSize-nebulaBubbleBaseSize);
  var pushDistance = nebulaBubbleBasePushDistance + Math.random() * (nebulaBubbleMaxPushDistance-nebulaBubbleBasePushDistance);
  if(pushDistance > size) {
    var tmp = size;
    size = pushDistance;
    pushDistance = tmp;
  }
  var color = {r:0,g:0,b:0};
  var total = 0;
  var dists=[];
  for(var j=0;j<starClusters.length; j++) {
    var val = Math.sqrt(Math.pow(starClusters[j].x-center.x,2) + Math.pow(starClusters[j].y-center.y,2));
    dists.push(val);
    total += val;
  }
  for(var j=0;j<starClusters.length; j++) {
    var fact =  dists[j]/total;
    color.r += starClusters[j].r * fact;
    color.g += starClusters[j].g * fact;
    color.b += starClusters[j].b * fact;
  }
  
  // Add some color randomness and determine strength
  var strength = (starClusters[clusterIdx].strength * Math.random()) / (15*starClusters[clusterIdx].bubbles);
  color.r = color.r * strength + (Math.random() * nebulaColorVariation)/100;
  color.g = color.g * strength + (Math.random() * nebulaColorVariation)/100;
  color.b = color.b * strength + (Math.random() * nebulaColorVariation)/100;  
  // Determine max affected area
  var xMin = Math.floor(Math.max(0,center.x - size));
  var xMax = Math.floor(Math.min(width,center.x + size));
  var yMin = Math.floor(Math.max(0,center.y - size));
  var yMax = Math.floor(Math.min(height,center.y + size));
  
  var distancePerAngle = [];
  for(var i=0;i<10;i++){
    distancePerAngle.push(0.8 + Math.random()*0.2);
  }


  for(var x=xMin; x<xMax; x++) {
    for(var y=yMin; y<yMax; y++) {   
      var angle = (Math.atan2(center.x-x, center.y-y) + Math.PI)/(2*Math.PI)*10; // -PI to PI
      var angleIdx = Math.floor(angle);
      var anglePart = angle - angleIdx  > 0 ? angle - angleIdx : angle - angleIdx + 1;
      angleIdx = angleIdx>9 ? angleIdx = 0 : angleIdx; // remove 2PI case    
      var distToCenter = Math.sqrt(Math.pow(center.x-x,2) + Math.pow(center.y-y,2));
      var sizeMod = determineSizeModifier(distancePerAngle, angleIdx, anglePart);      
      if(distToCenter >= (size*sizeMod)){
        continue;
      } 
      var interpolatedColor;     
      if(distToCenter >= (pushDistance*sizeMod)) {
        interpolatedColor = color;                          
      } else {
        interpolatedColor = interpolateColors({r:0,g:0,b:0}, color, distToCenter/(pushDistance*sizeMod));                
      }
      // Add noise
      interpolatedColor = interpolateColors(color,{r:0,g:0,b:0}, Math.random()/5);                
      setPixel(nebulaPixels,x,y,interpolatedColor.r, interpolatedColor.g , interpolatedColor.b);
    }
  }
}

function determineSizeModifier(distancePerAngle, angleIdx, anglePart) {
  var result;
  if(anglePart > 0.5) {
    var nextIdx = (angleIdx + 1) > 9 ? 0 : (angleIdx + 1);                
    result = distancePerAngle[angleIdx] * (1.5-anglePart) + distancePerAngle[nextIdx] * (anglePart-0.5);
    //console.log(""+angleIdx+"|"+anglePart+"> " + distancePerAngle[angleIdx] + "|"+distancePerAngle[nextIdx]+"="+result);
  } else if(anglePart < 0.5){
    var prevIdx = (angleIdx - 1) < 0 ? 9 : (angleIdx - 1);          
    result = distancePerAngle[prevIdx] * (0.5-anglePart) + distancePerAngle[angleIdx] * (0.5+anglePart);    
  } else {
    result = distancePerAngle[angleIdx];
  }  
  return result;
}

function interpolateColors(color1, color2, part) {
  var result = {
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
  var result = 0;
  for(var i=0; i<starClusters.length; i++){
    result += getClusterTotalToGenerate(i, nebula);
  }
  return result;
}

function getGenerated(){
  var result = 0;
  for(var i=0; i<starClusters.length; i++){
    result += starClusters[i].generated;
  }
  return result;
}

export function getProgress(nebula){
  return (100*getGenerated()) / getTotalToGenerate(nebula);
}

function resetGenerated(){
  for(var i=0; i<starClusters.length; i++){
    starClusters[i].generated = 0;
  }
}

export function getClusters() {
  return starClusters;
}

export function setClusterColor(idx, color){
  var rgb = color.toRGBA();
  starClusters[idx].r =rgb[0];
  starClusters[idx].g =rgb[1];
  starClusters[idx].b =rgb[2];
}

export function generate(clusterIdx, nebula, amount){  
  var idx = clusterIdx;        
  var notDone = starClusters[idx].generated < getClusterTotalToGenerate(clusterIdx, nebula);    
  for(var i=0; i < amount && notDone; i++) {
    if(nebula){
      createNebulaBubble(clusterIdx);
    } else {
      var starSize = 1;
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

function setContext(context) {
  ctx = context;
  pixelData = ctx.createImageData(1,1);
}

function setSettings(settings){
  nebulaColorVariation = settings[0];
  nebulaBubbleBaseSize = settings[1];
  nebulaBubbleMaxSize = settings[2];
  nebulaBubbleBasePushDistance = settings[3];
  nebulaBubbleMaxPushDistance = settings[4];
}

export function init(settings, nebula, context, width,height){
  setSettings(settings);
  setContext(context);    
  resetGenerated();
  if(nebula){    
    initNebulaPixels(width,height);
  } else {    
    initStarPixels(width,height);
  }
}