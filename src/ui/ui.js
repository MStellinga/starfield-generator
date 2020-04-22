import {setClusterColor, addNewCluster, getClusters} from '../generator/generator.js';
import {generateStars, generateNebula, generateFractal, cancelGenerate} from './generator-ui.js';
import '@simonwep/pickr/dist/themes/classic.min.css'; 
import Pickr from '@simonwep/pickr';

const MODE_VIEW = 0;
const MODE_EDIT = 1;
const MODE_ADD = 2;
var mode = MODE_VIEW;

const BASE_WIDTH = 800;
const BASE_HEIGHT = 400;
var width = BASE_WIDTH;
var height = BASE_HEIGHT;

function createInputField(value, id){
    let field = document.createElement('input');
    if(id){
        field.id = id;
    }
    field.value = value;
    field.type='text';
    field.pattern = '[0-9\\.]{1,5}';
    field.classList.add("smallfield");      
    return field;
}

function createClusterInputField(starCluster, attribute){
  let field = createInputField(starCluster[attribute]);    
  field.addEventListener("blur", (function(starCluster){
          return function(event){
              starCluster[attribute] = parseInt(event.target.value);
          }
      })(starCluster));
  return field;
}
 
function createPicker(element){
    return Pickr.create({
       el: element,
       theme: 'classic',   
       swatches: [
           'rgba(244, 67, 54, 1)',
           'rgba(233, 30, 99, 0.95)',
           'rgba(156, 39, 176, 0.9)',
           'rgba(103, 58, 183, 0.85)',
           'rgba(63, 81, 181, 0.8)',
           'rgba(33, 150, 243, 0.75)',
           'rgba(3, 169, 244, 0.7)',
           'rgba(0, 188, 212, 0.7)',
           'rgba(0, 150, 136, 0.75)',
           'rgba(76, 175, 80, 0.8)',
           'rgba(139, 195, 74, 0.85)',
           'rgba(205, 220, 57, 0.9)',
           'rgba(255, 235, 59, 0.95)',
           'rgba(255, 193, 7, 1)'
       ],  
       comparison: false,  
       components: {
           preview: false,
           opacity: true,
           hue: true
       }
      });
}

function createImageSettingsSection(){
  let imageSettings = document.getElementById('imagesize');
  imageSettings.innerHTML = '<h2>Image</h2>';
  
  let table = document.createElement('table');
  let tbody = document.createElement('tbody');

  let tr = document.createElement('tr');
  let td = document.createElement('td');
  td.innerText = 'Image size';
  tr.appendChild(td);
  td = document.createElement('td');
  td.appendChild(createInputField(BASE_WIDTH,'image-width'));
  tr.appendChild(td);
  td = document.createElement('td');
  td.innerText = 'x';
  tr.appendChild(td);
  td = document.createElement('td');
  td.appendChild(createInputField(BASE_HEIGHT,'image-height'));
  tr.appendChild(td);
  tbody.appendChild(tr);

  table.appendChild(tbody);
  imageSettings.appendChild(table);

  let sizeButton = document.createElement('button');
  sizeButton.id = 'save-size-button';
  sizeButton.innerText='Set';
  sizeButton.addEventListener("click",onSetSizeClick);
  imageSettings.appendChild(sizeButton);
}

export function showClusters(){
  let clusters = document.getElementById('clusters');
  clusters.innerHTML = '<h2>Background / Clusters</h2>'; // Clear it
  let clusterTable = document.createElement('table');
  let thead  = document.createElement('thead');
  thead.innerHTML = "<tr><th></th><th>Power</th><th>Stars 1</th><th>Stars 2</th><th>Stars 3</th><th>Bubbles</th><th>Fractal</th><th>Color</th><th></th></tr>"
  clusterTable.appendChild(thead);

  let editor = document.getElementById('cluster-editor');
  editor.innerHTML = '';

  let tbody = document.createElement('tbody');
  let starClusters = getClusters();
  for(let i=0; i<starClusters.length; i++){
    let cluster = document.createElement('tr');
    cluster.innerHTML = i ==0 ? '<td></td>' : '<td>'+i+'</td>';

    let td = document.createElement('td');    
    if(i>0) {
      td.appendChild(createClusterInputField(starClusters[i], 'strength'));
    }
    cluster.appendChild(td);
    td = document.createElement('td');
    td.appendChild(createClusterInputField(starClusters[i], 'size1stars'));
    cluster.appendChild(td);
    td = document.createElement('td');
    td.appendChild(createClusterInputField(starClusters[i], 'size2stars'));
    cluster.appendChild(td);
    td = document.createElement('td');
    td.appendChild(createClusterInputField(starClusters[i], 'size3stars'));
    cluster.appendChild(td);
    td = document.createElement('td');
    td.appendChild(createClusterInputField(starClusters[i], 'bubbles'));
    cluster.appendChild(td);
    td = document.createElement('td');
    td.appendChild(createClusterInputField(starClusters[i], 'fractalSize'));
    cluster.appendChild(td);

    td = document.createElement('td');    
    let colorPicker = document.createElement('div');
    td.appendChild(colorPicker);
    cluster.appendChild(td);      
    let picker = createPicker(colorPicker);
    let c = 'rgb('+starClusters[i].r+','+starClusters[i].g+','+starClusters[i].b+')';
    picker.on('init', (function(c,picker){
      return function(){
          picker.setColor(c);
      }
    })(c,picker));
    picker.on('change', (function(idx){
      return function(color){                          
        setClusterColor(idx,color);    
        updateClusterCircles();          
      }
    })(i));

    td = document.createElement('td');
    if(i>0) {
      let removeButton = document.createElement('button');
      removeButton.innerHTML = "X";
      removeButton.addEventListener("click", (function(idx){
        return function(event){
          starClusters.splice(idx,1);
          showClusters();
          event.preventDefault();
        }
      })(i));
      td.appendChild(removeButton);

      let clusterCircle = document.createElement('div');
      clusterCircle.classList.add('cluster-circle');
      clusterCircle.setAttribute('data-cluster-id',i);
      clusterCircle.style.left = starClusters[i].x + 'px';
      clusterCircle.style.top = starClusters[i].y + 'px';
      clusterCircle.style.backgroundColor = 'rgb('+starClusters[i].r+','+starClusters[i].g+','+starClusters[i].b+')';
      editor.appendChild(clusterCircle);
    }
    cluster.appendChild(td);    
    tbody.appendChild(cluster);
  }
  clusterTable.appendChild(tbody);
  clusters.appendChild(clusterTable);

  let addButton = document.createElement('button');
  addButton.id = 'add-cluster-button';
  addButton.innerText='Add';
  addButton.addEventListener("click",onAddClusterClick);    
  clusters.appendChild(addButton);

  let editButton = document.createElement('button');
  editButton.id = 'edit-cluster-button';
  editButton.innerText='Edit';
  editButton.addEventListener("click",onEditClusterClick);
  clusters.appendChild(editButton);
  setMode(mode);
}

function createSettingsSection(){
  let generate = document.getElementById('generate');
  generate.innerHTML = '<h2>Settings</h2>'; 

  let table = document.createElement('table');
  let tbody = document.createElement('tbody');
  
  let tr = document.createElement('tr');
  let td = document.createElement('td');
  td.innerText = 'Bubble sizes';
  tr.appendChild(td);
  td = document.createElement('td');
  td.appendChild(createInputField(30,'nebula-bubble-base-size'));    
  tr.appendChild(td);
  td = document.createElement('td');
  td.innerText = '-';
  tr.appendChild(td);    
  td = document.createElement('td');
  td.appendChild(createInputField(160,'nebula-bubble-max-size'));    
  tr.appendChild(td);
  tbody.appendChild(tr);

  tr = document.createElement('tr');
  td = document.createElement('td');
  td.innerText = 'Dark center size';
  tr.appendChild(td);
  td = document.createElement('td');
  td.appendChild(createInputField(30,'nebula-push-base-size'));
  tr.appendChild(td);
  td = document.createElement('td');
  td.innerText = '-';
  tr.appendChild(td);
  td = document.createElement('td');
  td.appendChild(createInputField(80,'nebula-push-max-size'));
  tr.appendChild(td);
  tbody.appendChild(tr);

  tr = document.createElement('tr');
  td = document.createElement('td');
  td.innerText = 'Bubble distance fall-off';
  td.colSpan = 3;
  tr.appendChild(td);
  td = document.createElement('td');
  td.appendChild(createInputField(2,'color-distance-falloff'));
  tr.appendChild(td);
  tbody.appendChild(tr);

  tr = document.createElement('tr');
  td = document.createElement('td');
  td.innerText = 'Bubble color desaturate';
  td.colSpan = 3;
  tr.appendChild(td);
  td = document.createElement('td');
  td.appendChild(createInputField(4,'color-dampening'));
  tr.appendChild(td);
  tbody.appendChild(tr);

  tr = document.createElement('tr');
  td = document.createElement('td');
  td.innerText = 'Fractal division count';
  td.colSpan = 3;
  tr.appendChild(td);
  td = document.createElement('td');
  td.appendChild(createInputField(6,'fractal-division-count'));
  tr.appendChild(td);
  tbody.appendChild(tr);

  tr = document.createElement('tr');
  td = document.createElement('td');
  td.innerText = 'Fractal min size';
  td.colSpan = 3;
  tr.appendChild(td);
  td = document.createElement('td');
  td.appendChild(createInputField(5,'fractal-minsize'));
  tr.appendChild(td);
  tbody.appendChild(tr);

  tr = document.createElement('tr');
  td = document.createElement('td');
  td.innerText = 'Fractal color gain (%)';
  td.colSpan = 3;
  tr.appendChild(td);
  td = document.createElement('td');
  td.appendChild(createInputField(10,'fractal-color-gain'));
  tr.appendChild(td);
  tbody.appendChild(tr);

  table.appendChild(tbody);
  generate.appendChild(table);

  let genLabel = document.createElement('label');
  genLabel.innerText = 'Generate';
  generate.appendChild(genLabel);

  let starButton = document.createElement('button');
  starButton.id = 'button-generate-stars';
  starButton.innerText = 'Stars';
  starButton.addEventListener("click", ()=>{
    setMode(MODE_VIEW);
    generateStars();
  });
  generate.appendChild(starButton);

  let nebulaButton = document.createElement('button');
  nebulaButton.id = 'button-generate-nebula';
  nebulaButton.innerText = 'Bubble nebula';
  nebulaButton.addEventListener("click", ()=>{ 
    setMode(MODE_VIEW);
    generateNebula();
  });
  generate.appendChild(nebulaButton);

  let fractalButton = document.createElement('button');
  fractalButton.id = 'button-generate-fractal';
  fractalButton.innerText = 'Fractal nebula';
  fractalButton.addEventListener("click", ()=>{ 
    setMode(MODE_VIEW);
    generateFractal();
  });
  generate.appendChild(fractalButton);

  let cancelButton = document.createElement('button');
  cancelButton.id = 'button-generate-cancel';
  cancelButton.innerText = 'Cancel';
  cancelButton.style.display = 'none';
  cancelButton.addEventListener("click", ()=>{ 
    cancelGenerate();
  });
  generate.appendChild(cancelButton);
}

function createProgressSection(){
  let progress = document.getElementById('progress');
  progress.innerHTML = '<div id="progress-done" style="width:0%"></div>';
}

function createCanvas(){
  let picture = document.getElementById("picture");
  picture.innerHTML='';
  picture.style.width=''+(width+3)+'px';

  let canvas = document.createElement('canvas');
  canvas.id = 'star-canvas';
  canvas.width=width;
  canvas.height=height;       

  let editor = document.createElement('div');
  editor.id='cluster-editor';
  editor.style.display = 'none';
  editor.style.width=''+width+'px';
  editor.style.height=''+height+'px';
  editor.addEventListener('click',onClusterClick);
  picture.appendChild(editor);

  document.addEventListener("dragstart", function(event) {
    let idx = parseInt(event.target.getAttribute('data-cluster-id'));    
    if(!isNaN(idx)){
      event.dataTransfer.setData('index',''+idx);
    }
  });  
  editor.addEventListener("dragover", function(event) {
    event.preventDefault();
  });  
  editor.addEventListener("drop", function(event) {
    let idx = parseInt(event.dataTransfer.getData('index'));    
    if(!isNaN(idx)){
      let rect = event.target.getBoundingClientRect();      
      let x = Math.round(event.clientX - rect.left); 
      let y = Math.round(event.clientY - rect.top);  
      getClusters()[idx].x = x;
      getClusters()[idx].y = y;
      updateClusterCircles();
    }
  });
  
  picture.appendChild(canvas);  

  let a = document.createElement('a');
  a.id = 'download';
  a.download='Starfield.png';
  let button = document.createElement('button');
  button.addEventListener('click',download);
  button.innerText='Save to file';
  a.appendChild(button);
  picture.appendChild(a);
}

function updateClusterCircles(){
  let circles = document.getElementsByClassName('cluster-circle');    
  let starClusters = getClusters();
  for(let i=0; i<circles.length; i++){
    let idx = circles[i].getAttribute('data-cluster-id');    
    circles[i].style.left = starClusters[idx].x + 'px';
    circles[i].style.top = starClusters[idx].y + 'px';
    circles[i].style.backgroundColor = 'rgb('+starClusters[idx].r+','+starClusters[idx].g+','+starClusters[idx].b+')';
  }
}

function setMode(newMode){
  let canvas = document.getElementById('star-canvas');
  let editor = document.getElementById('cluster-editor');
  let editButton = document.getElementById('edit-cluster-button');  
  let addButton = document.getElementById('add-cluster-button');  
  let dragHandles = document.getElementsByClassName('cluster-circle');
  switch(newMode){
    case MODE_VIEW:
      editor.style.display = 'none';
      canvas.style.display = '';
      editor.style.cursor = '';
      addButton.style.display = '';
      editButton.innerText = 'Edit';
      addButton.innerText = 'Add';
      break;
    case MODE_EDIT:
      editor.style.display = '';
      canvas.style.display = 'none';
      editor.style.cursor = '';
      addButton.style.display = '';
      editButton.innerText = 'Done';
      addButton.innerText = 'Add';
      for(let i=0; i<dragHandles.length; i++){
        dragHandles[i].draggable = true;
        dragHandles[i].style.cursor = 'pointer';
      }
      break;
    case MODE_ADD:
      editor.style.display = '';
      canvas.style.display = 'none';
      editor.style.cursor = 'crosshair';      
      editButton.innerText = 'Edit';
      addButton.innerText = 'Done';
      for(let i=0; i<dragHandles.length; i++){
        dragHandles[i].draggable = false;
        dragHandles[i].style.cursor = 'crosshair';
      }
      break;
  }
  mode = newMode;
}

function onClusterClick(event) {
  if(mode == MODE_ADD) {    
    addNewCluster(event.offsetX, event.offsetY);  
    showClusters();
  }
}

function onAddClusterClick(event){  
  switch(mode){
    case MODE_VIEW:
      setMode(MODE_ADD);
      break;
    case MODE_EDIT:
      setMode(MODE_ADD);
      break;    
    case MODE_ADD:
      setMode(MODE_VIEW);
      break;  
  }
}

function onEditClusterClick(event){
  switch(mode){
    case MODE_VIEW:
      setMode(MODE_EDIT);
      break;
    case MODE_EDIT:
      setMode(MODE_VIEW);
      break;
    case MODE_ADD:
      setMode(MODE_EDIT);
      break;
  }
}

function onSetSizeClick(event){
  width = parseInt(document.getElementById('image-width').value);
  height = parseInt(document.getElementById('image-height').value);
  if(isNaN(width)){
    width = BASE_WIDTH;
  }
  if(isNaN(height)){
    width = BASE_HEIGHT;
  }  
  createCanvas();
  showClusters();   
}

function download() {
  let download = document.getElementById("download");
  let image = document.getElementById("star-canvas").toDataURL("image/png").replace("image/png", "image/octet-stream");
  download.setAttribute("href", image);
}

export function createUI(){
  createImageSettingsSection();
  createSettingsSection();    
  createProgressSection();
  createCanvas();
  showClusters();       
}