import { h } from 'preact';
import {useState} from 'preact/hooks';
import Picker from 'react-color'
import style from './color-picker.css';

const popover = {
    position: 'absolute',
    zIndex: '2',
}
const cover = {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
}

function ColorPicker (props) {
    const [show, setShow] = useState(false);    
    
    function handleClick(){    
        let newValue = !show;
        setShow(newValue);      
    }
  
    function handleClose(){        
        setShow(false);
    }  

    function handleChange(color) {
        props.onChange(color);
    }

    function colorToCSS(){
        return {'background-color': `rgb(${props.color.r},${props.color.g},${props.color.b})` };
    }
      
    return (
        <div>
            <div onClick={ handleClick } class={style.pickerButton} style={colorToCSS()} />
            { show ? <div style={ popover }>
                <div style={ cover } onClick={ handleClose } />
                <Picker color={ props.color } onChange={ handleChange } />
                </div> : null }
        </div>
    );    
}
  
export default ColorPicker;