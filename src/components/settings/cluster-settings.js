import { h } from 'preact';
import style from '../style.css';
import clusterStyle from './cluster-settings.css';
import TextInput from '../elements/text-input';
import ColorPicker from '../elements/color-picker';

function ClusterSettings (props) {

    function setInt(idx, name) {
        return (event) => {
            let newValue = parseInt(event.target.value, 10);
            props.setValueCallback(idx,name, isNaN(newValue) ? props.clusters[idx][name] : newValue);          
        }
    }

    function setColor(idx) {
        return (color) => {          
            props.setValueCallback(idx,'color', color.rgb);                  
        }
    }

    const clusterLines = props.clusters.map((cluster, index) =>
        <tr key={index}>
            <td>{index>0?index:''}</td>            
            <td>{((index>0 && <TextInput value={cluster.strength} onChange={setInt(index,'strength')} />))}</td>
            <td><TextInput value={cluster.size1stars} onChange={setInt(index,'size1stars')} /></td>
            <td><TextInput value={cluster.size2stars} onChange={setInt(index,'size2stars')} /></td>
            <td><TextInput value={cluster.size3stars} onChange={setInt(index,'size3stars')} /></td>
            <td><TextInput value={cluster.bubbles} onChange={setInt(index,'bubbles')} /></td>
            <td><TextInput value={cluster.fractalSize} onChange={setInt(index,'fractalSize')} /></td>
            <td><ColorPicker color={cluster} onChange={setColor(index)} /></td>
            <td><button onClick={()=>{props.removeCallback(index)}}>X</button></td>
        </tr>
    );

    return (<div class={style.section}>
        <h2>Clusters</h2>
        <table class={clusterStyle.clusters}>
            <thead>
                <tr>
                    <th />
                    <th>Power</th>
                    <th>Stars 1</th>
                    <th>Stars 2</th>
                    <th>Stars 3</th>
                    <th>Bubbles</th>
                    <th>Fractal</th>
                    <th>Color</th>
                    <th />
                </tr>
            </thead>
            <tbody>
                {clusterLines}
            </tbody>
        </table>        
    </div>);   
}

export default ClusterSettings;