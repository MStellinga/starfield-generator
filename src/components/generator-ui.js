import { h } from 'preact';
import {useState, useEffect} from 'preact/hooks';
import style from './style.css';
import ImageSettings from './settings/image-settings';
import ClusterSettings from './settings/cluster-settings';
import GenerateSettings from './settings/generate-settings';
import Picture from './settings/picture';
import Progress from './elements/progress';
import {prepareGenerate, generate, applyBlur, getProgress, GENERATE_STARS, GENERATE_NEBULA, GENERATE_FRACTAL} from '../generator/generator'

function GeneratorUI() {

  const [settings, setSettings] = useState(
    {    
      nebulaBubbleBaseSize:30,
      nebulaBubbleMaxSize: 160,
      nebulaBubbleCenterBaseSize: 30,
      nebulaBubbleCenterMaxSize: 80,
      colorDistanceFalloff: 2.0,
      colorDampening: 4.0,
      fractalDivisionCount: 6,
      fractalMinSize: 5,
      fractalColorGain: 42,
      blueStars: false,
      blurNebula: false,
      blurFractal: false      
    }  
  );
  const [clusters, setClusters] = useState(
    [
      {x: -1, y: -1,   strength: 0, r: 255, g: 255, b:255,a:255, size1stars:2000, size2stars:100, size3stars:50, bubbles:0, generated:0, fractalSize: 0 },
      {x: 80, y: 50,   strength: 100, r: 0, g: 200, b:250,a:255, size1stars:300, size2stars:50, size3stars:10, bubbles:500, generated:0, fractalSize: 0 },
      {x: 350, y: 250, strength: 30, r: 0, g: 150, b:200,a:255, size1stars:300, size2stars:50, size3stars:10, bubbles:500, generated:0, fractalSize: 0 },
      {x: 600, y: 320, strength: 300, r: 0, g: 0, b:250,a:255, size1stars:300, size2stars:50, size3stars:10, bubbles:500, generated:0, fractalSize: 0 },
      {x: 400, y: 200, strength: 300, r: 230, g: 0, b:40,a:255, size1stars:0, size2stars:0, size3stars:0, bubbles:0, generated:0, fractalSize: 100 },
    ]
  );
  const [width,setWidth] = useState(800);
  const [height,setHeight] = useState(400);
  const [shouldPaint, setShouldPaint] = useState(false);  
  const [canceled, setCanceled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [handled, setHandled] = useState(-1);
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState(GENERATE_STARS);
  const batchSize = 1000;

  const updateCluster = (idx, name,val) => {    
    let newCluster;
    if(name === 'color') {
      newCluster = {
        ...clusters[idx],
        r: val.r,
        g: val.g,
        b: val.b,
      };
    } else if(name === 'pos') {
      newCluster = {
        ...clusters[idx],
        x: val.x,
        y: val.y
      };
    } else {
      newCluster = {
        ...clusters[idx],
        [name]: val
      };
    }
    let newClusters = [...clusters];
    newClusters[idx] = newCluster;
    setClusters(newClusters);
  };

  const updateSetting = (name,val) => {    
    setSettings({
      ...settings,
      [name]: val
    });
  };

  const addCluster = (pos) => {
    let newClusters = [...clusters];
    newClusters.push({x: pos.x, y: pos.y, strength: 100, r: 200, g: 200, b:200,a:255, size1stars:0, size2stars:0, size3stars:0, bubbles:0, generated:0, fractalSize: 0 });
    setClusters(newClusters);
  }

  const removeCluster = (idx) => {
    let newClusters = [...clusters];
    newClusters.splice(idx,1);
    setClusters(newClusters);
  }

  useEffect(() => {
    if(!canceled && handled>-1) {    
      const timer = setTimeout(() => {
        let clusterCount = clusters.length;
        if(idx < clusterCount) {
          let done = !generate(idx, mode, batchSize);         
          let progress = getProgress(mode);          
          setProgress(progress>99 ? 100 : progress);
          setHandled(handled+10);            
          if(done && idx + 1 < clusterCount) {      
            setIdx(idx+1);
          } else if(done){                      
            applyBlur(mode);                        
            setProgress(0);
            setShouldPaint(true);
            setHandled(-1);
          }
        } 
      }, 0);
      return () => clearTimeout(timer);
    } else if(canceled){
      setProgress(0);
      setHandled(-1);
      setShouldPaint(true);
    }    
  }, [canceled, clusters.length, handled, idx, mode]);

  function startGenerate(mode){
    prepareGenerate(settings, clusters, mode, width, height);
    setCanceled(false);
    setMode(mode);
    setIdx(0);
    setProgress(0);   
    setHandled(0);   
  }

	return (   
    <div>
      <div class={style.container}>                
        <GenerateSettings settings={settings} setValueCallback={updateSetting} />

        <ClusterSettings clusters={clusters} setValueCallback={updateCluster} removeCallback={removeCluster} />

        <ImageSettings width={width} height={height} updateWidth={setWidth} updateHeight={setHeight} />
            
        <div class={style.section}>
          <label>Generate</label>
          {((handled < 0 && <button id="button-generate-stars" onClick={()=>{startGenerate(GENERATE_STARS)}}>Stars</button>))}
          {((handled < 0 && <button id="button-generate-nebula" onClick={()=>{startGenerate(GENERATE_NEBULA)}}>Bubble nebula</button>))}
          {((handled < 0 && <button id="button-generate-fractal" onClick={()=>{startGenerate(GENERATE_FRACTAL)}}>Fractal nebula</button>))}
          {((handled >=0 && <button id="button-generate-cancel" onClick={()=>{setCanceled(true)}}>Cancel</button>))}
        </div>
        
        <Progress progress={progress} />      
      </div>
      <Picture clusters={clusters.slice(1)} setValueCallback={updateCluster} addCallback={addCluster} shouldPaint={shouldPaint} donePainting={()=>setShouldPaint(false)} width={width} height={height} />
    </div> 
  );
}

export default GeneratorUI;