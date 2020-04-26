import { h } from 'preact';
import {useLayoutEffect,useRef, useEffect, useState} from 'preact/hooks';
import {paint} from '../../generator/generator';
import style from './picture.css';

const MODE_VIEW = 0;
const MODE_ADD = 1;
const MODE_EDIT = 2;

function ClusterCircle(props) {

    function createStyle(){
        return { 
            left: props.cluster.x, 
            top: props.cluster.y, 
            backgroundColor: `rgb(${props.cluster.r},${props.cluster.g},${props.cluster.b})`
        }
    }

    return (<div data-cluster-id={props.idx} draggable="true" class={style.clusterCircle} style={createStyle()} />)            
}

function Picture (props){

    const [mode,setMode] = useState(MODE_VIEW);
    const starCanvas = useRef(null);
    const [pictureData,setPictureData] = useState('');

    function paintCanvas(){
        let canvas = starCanvas.current;
        paint(canvas.getContext("2d"));
        setPictureData(canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
    }

    useLayoutEffect(() => {
        if(props.shouldPaint){                        
            paintCanvas();            
            props.donePainting();
        }
    }, [props, props.shouldPaint]);
    
    useEffect(() => {
        document.addEventListener("dragstart", onDragStart);
    }, []);

    function onDragStart(event) {
        let idx = parseInt(event.target.getAttribute('data-cluster-id'),10);    
        if(!isNaN(idx)){
            event.dataTransfer.setData('index',idx);
        }
    }

    function onDragOver(event) {
        // Needed to trigger drop
        event.preventDefault();
    }

    function onDrop(event) {
        let idx = parseInt(event.dataTransfer.getData('index'), 10);    
        if(!isNaN(idx)){
            let rect = event.target.getBoundingClientRect();      
            let x = Math.round(event.clientX - rect.left); 
            let y = Math.round(event.clientY - rect.top);              
            props.setValueCallback(idx,'pos', {x, y});            
        }
    }

    function onClick(event){
        if(mode == MODE_ADD){            
            props.addCallback({x:event.offsetX,y:event.offsetY});
        }
    }

    function createStyle(addHeight){
        let result = {width: props.width};
        if(addHeight){
            result.height = props.height;
        }
        return result;
    }

    return (
    <div class={style.picture} style={createStyle(false)}>
        <div class={style.pictureEditButtons}>
            {((mode!==MODE_ADD && <button onclick={()=>{setMode(MODE_ADD)}}>Add</button>))}
            {((mode!==MODE_EDIT && <button onclick={()=>{setMode(MODE_EDIT)}}>Move</button>))}
            {((mode!==MODE_VIEW && <button onclick={()=>{setMode(MODE_VIEW)}}>Done</button>))}
        </div>
        {((mode===MODE_VIEW && <canvas ref={starCanvas} width={props.width} height={props.height} class={style.starcanvas} />))}
        {((mode!==MODE_VIEW && 
            <div class={style.clusterEditor} data-mode={mode} style={createStyle(true)} onDragOver={onDragOver} onDrop={onDrop} onClick={onClick}>
                {props.clusters.map((cluster, index) =>
                    <ClusterCircle key={index} idx={index+1} cluster={cluster} />            
                )}
            </div>
        ))}
        <div class={style.pictureEditButtons}>
            <a href={pictureData} download="Starfield.png">
                <button>Save to File</button>
            </a>
        </div>
    </div>);  
}

export default Picture;
