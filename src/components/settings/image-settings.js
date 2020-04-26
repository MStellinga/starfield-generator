import { h } from 'preact';
import style from '../style.css';
import TextInput from '../elements/text-input';

function ImageSettings(props) {

    function setWidth(event) {
        let newValue = parseInt(event.target.value, 10);
        props.updateWidth(isNaN(newValue) ? props.width : newValue);              
    }

    function setHeight(event) {
        let newValue = parseInt(event.target.value, 10);
        props.updateHeight(isNaN(newValue) ? props.height : newValue);              
    }

    return (<div class={style.section}>
        <div>
            Image size <TextInput value={props.width} onChange={setWidth} /> x <TextInput value={props.height} onChange={setHeight} />            
        </div>
        
    </div>);  
}

export default ImageSettings;
