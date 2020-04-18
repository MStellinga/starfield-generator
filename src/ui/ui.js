import {setClusterColor, addNewCluster, getClusters} from '../generator/generator.js';
import {generateStars, generateNebula} from './generator-ui.js';
import '@simonwep/pickr/dist/themes/classic.min.css'; 
import Pickr from '@simonwep/pickr';

const MODE_VIEW = 0;
const MODE_EDIT = 1;
const MODE_ADD = 2;
var mode = MODE_VIEW;

function createInputField(value, id){
    var field = document.createElement('input');
    if(id){
        field.id = id;
    }
    field.value = value;
    field.classList.add("smallfield");      
    return field;
}

function createClusterInputField(starCluster, attribute){
    var field = createInputField(starCluster[attribute]);    
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

function createStarsSection(){
    var stars = document.getElementById('stars');
    stars.innerHTML = '<h2>Stars</h2>'; 

    var button = document.createElement('button');
    button.innerText = 'Generate stars';
    button.addEventListener("click", ()=>{
      setMode(MODE_VIEW);
      generateStars();
    });
    stars.appendChild(button);
}

function createNebulaSection(){
    var nebula = document.getElementById('nebula');
    nebula.innerHTML = '<h2>Nebula Generation</h2>'; 

    var table = document.createElement('table');
    var tbody = document.createElement('tbody');
    
    var tr = document.createElement('tr');
    var td = document.createElement('td');
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

    table.appendChild(tbody);
    nebula.appendChild(table);

    var button = document.createElement('button');
    button.innerText = 'Generate nebula';
    button.addEventListener("click", ()=>{ 
      setMode(MODE_VIEW);
      generateNebula();
    });
    nebula.appendChild(button);
}

export function showClusters(){
    var clusters = document.getElementById('clusters');
    clusters.innerHTML = '<h2>Clusters</h2>'; // Clear it
    var clusterTable = document.createElement('table');
    var thead  = document.createElement('thead');
    thead.innerHTML = "<tr><th>X</th><th>Y</th><th>Strength</th><th>Stars[1]</th><th>Stars[2]</th><th>Stars[3]</th><th>Nebula bubbles</th><th>Color</th><th></th></tr>"
    clusterTable.appendChild(thead);
  
    var editor = document.getElementById('cluster-editor');
    editor.innerHTML = '';

    var tbody = document.createElement('tbody');
    var starClusters = getClusters();
    for(var i=0; i<starClusters.length; i++){
      var cluster = document.createElement('tr');
      cluster.innerHTML = i ==0 ? '<td colspan=2>Background</td>' : '<td>'+starClusters[i].x+'</td><td>'+starClusters[i].y+'</td>';
  
      var td = document.createElement('td');    
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
      if(i>0) {
        var colorPicker = document.createElement('div');
        td.appendChild(colorPicker);
        cluster.appendChild(td);      
        var picker = createPicker(colorPicker);
        var c = 'rgb('+starClusters[i].r+','+starClusters[i].g+','+starClusters[i].b+')';
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
      }
  
      td = document.createElement('td');
      if(i>0) {
        var removeButton = document.createElement('button');
        removeButton.innerHTML = "X";
        removeButton.addEventListener("click", (function(idx){
          return function(event){
            starClusters.splice(idx,1);
            showClusters();
            event.preventDefault();
          }
        })(i));
        td.appendChild(removeButton);

        var clusterCircle = document.createElement('div');
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

    var addButton = document.createElement('button');
    addButton.id = 'add-cluster-button';
    addButton.innerText='Add';
    addButton.addEventListener("click",onAddClusterClick);    
    clusters.appendChild(addButton);

    var editButton = document.createElement('button');
    editButton.id = 'edit-cluster-button';
    editButton.innerText='Edit';
    editButton.addEventListener("click",onEditClusterClick);
    clusters.appendChild(editButton);
    setMode(mode);
}

function updateClusterCircles(){
  var circles = document.getElementsByClassName('cluster-circle');    
  var starClusters = getClusters();
  for(var i=0; i<circles.length; i++){
    var idx = circles[i].getAttribute('data-cluster-id');    
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
      break;
    case MODE_EDIT:
      editor.style.display = '';
      canvas.style.display = 'none';
      editor.style.cursor = '';
      addButton.style.display = '';
      editButton.innerText = 'Done';
      for(var i=0; i<dragHandles.length; i++){
        dragHandles[i].draggable = true;
        dragHandles[i].style.cursor = 'pointer';
      }
      break;
    case MODE_ADD:
      editor.style.display = '';
      canvas.style.display = 'none';
      editor.style.cursor = 'crosshair';
      addButton.style.display = 'none';
      editButton.innerText = 'Cancel';
      for(var i=0; i<dragHandles.length; i++){
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
      setMode(MODE_VIEW);
      break;
  }
}

function createProgressSection(){
    var progress = document.getElementById('progress');
    progress.innerHTML = '<div id="progress-done" style="width:0%"></div>';
}

function createCanvas(){
  var picture = document.getElementById("picture");

  var canvas = document.createElement('canvas');
  canvas.id = 'star-canvas';
  // TODO sizing
  canvas.width=712;
  canvas.height=420;       

  var editor = document.createElement('div');
  editor.id='cluster-editor';
  editor.style.display = 'none';
  editor.style.width='712px';
  editor.style.height='420px';
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
      var rect = event.target.getBoundingClientRect();      
      var x = Math.round(event.clientX - rect.left); 
      var y = Math.round(event.clientY - rect.top);  
      getClusters()[idx].x = x;
      getClusters()[idx].y = y;
      updateClusterCircles();
    }
  });
  
  picture.appendChild(canvas);  
}

export function createUI(){
    createStarsSection();
    createNebulaSection();
    createProgressSection();
    createCanvas();
    showClusters();       
}