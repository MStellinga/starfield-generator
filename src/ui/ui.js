import {setClusterColor, getClusters} from '../generator/generator.js';
import {generateStars, generateNebula} from './generator-ui.js';
import '@simonwep/pickr/dist/themes/classic.min.css';   // 'classic' theme
import '@simonwep/pickr/dist/themes/monolith.min.css';  // 'monolith' theme
import '@simonwep/pickr/dist/themes/nano.min.css';      // 'nano' theme

// Modern or es5 bundle (pay attention to the note below!)
import Pickr from '@simonwep/pickr';

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
       theme: 'classic', // or 'monolith', or 'nano'
  
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
  
           // Main components
           preview: false,
           opacity: true,
           hue: true,
           // Input / output Options
           interaction: {
               hex: false,
               rgba: false,
               hsla: false,
               hsva: false,
               cmyk: false,
               input: false,
               clear: false,
               save: false
           }
       }
      });
}

function createStarsSection(){
    var stars = document.getElementById('stars');
    stars.innerHTML = '<h2>Stars</h2>'; 

    var button = document.createElement('button');
    button.innerText = 'Generate stars';
    button.addEventListener("click", ()=>{ generateStars()});
    stars.appendChild(button);
}

function createNebulaSection(){
    var nebula = document.getElementById('nebula');
    nebula.innerHTML = '<h2>Nebula Generation</h2>'; 

    var table = document.createElement('table');
    var tbody = document.createElement('tbody');
    
    var tr = document.createElement('tr');    
    var td = document.createElement('td');
    td.innerText = 'Color variation %';
    tr.appendChild(td);
    td = document.createElement('td');
    td.appendChild(createInputField(5,'nebula-color-variation'));        
    tr.appendChild(td);
    tr.appendChild(document.createElement('td'));
    tr.appendChild(document.createElement('td'));
    tbody.appendChild(tr);

    tr = document.createElement('tr');
    td = document.createElement('td');
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
    td.innerText = 'Bubble clear distance';
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
    button.addEventListener("click", ()=>{ generateNebula()});
    nebula.appendChild(button);
}

function addCluster(event){
    var newCluster = {x: event.offsetX, y:event.offsetY, strength: 3, r: 100, g: 100, b:255};
    starClusters.push(newCluster);
    showClusters();
}


export function showClusters(){
    var clusters = document.getElementById('clusters');
    clusters.innerHTML = '<h2>Clusters</h2>'; // Clear it
    var clusterTable = document.createElement('table');
    var thead  = document.createElement('thead');
    thead.innerHTML = "<tr><th>X</th><th>Y</th><th>Strength</th><th>Stars[1]</th><th>Stars[2]</th><th>Stars[3]</th><th>Nebula bubbles</th><th>Color</th><th></th></tr>"
    clusterTable.appendChild(thead);
  
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
      }
      cluster.appendChild(td);    
      tbody.appendChild(cluster);
    }
    clusterTable.appendChild(tbody);
    clusters.appendChild(clusterTable);
}

function createProgressSection(){
    var progress = document.getElementById('progress');
    progress.innerHTML = '<div id="progress-done" style="width:0%"></div>';
}

export function createUI(){
    createStarsSection();
    createNebulaSection();
    createProgressSection();
    showClusters();
}