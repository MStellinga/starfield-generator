import { h } from 'preact';
import style from '../style.css';
import TextInput from '../elements/text-input';
import Checkbox from '../elements/checkbox';

function GenerateSettings(props) {
    
    function setBool(name) {
        return (event) => {
            props.setValueCallback(name, event.target.checked);
        };
    }

    function setInt(name) {
        return (event) => {
            let newValue = parseInt(event.target.value, 10);
            props.setValueCallback(name, isNaN(newValue) ? props.settings[name] : newValue);          
        }
    }

    function setFloat(name) {
        return (event) => {
            let newValue = parseFloat(event.target.value);
            props.setValueCallback(name, isNaN(newValue) ? props.settings[name] : newValue);
        }
    }

    return(
        <div class={style.section}>
            <h2>Settings</h2>
            <table>
                <tbody>
                    <tr>
                        <td>Bubble sizes</td>
                        <td><TextInput value={props.settings.nebulaBubbleBaseSize} onChange={setInt('nebulaBubbleBaseSize')} /></td>
                        <td>-</td>
                        <td><TextInput value={props.settings.nebulaBubbleMaxSize} onChange={setInt('nebulaBubbleMaxSize')} /></td>
                    </tr>
                    <tr>
                        <td>Dark center size</td>
                        <td><TextInput value={props.settings.nebulaBubbleCenterBaseSize} onChange={setInt('nebulaBubbleCenterBaseSize')} /></td>
                        <td>-</td>
                        <td><TextInput value={props.settings.nebulaBubbleCenterMaxSize} onChange={setInt('nebulaBubbleCenterMaxSize')} /></td>
                    </tr>
                    <tr>
                        <td colspan="3">Bubble distance fall-off</td>
                        <td><TextInput value={props.settings.colorDistanceFalloff} onChange={setFloat('colorDistanceFalloff')} /></td>
                    </tr>
                    <tr>
                        <td colspan="3">Bubble color desaturate</td>
                        <td><TextInput value={props.settings.colorDampening} onChange={setFloat('colorDampening')} /></td>
                    </tr>
                    <tr>
                        <td colspan="3">Fractal division count</td>
                        <td><TextInput value={props.settings.fractalDivisionCount} onChange={setInt('fractalDivisionCount')} /></td>
                    </tr>
                    <tr>
                        <td colspan="3">Fractal min size</td>
                        <td><TextInput value={props.settings.fractalMinSize} onChange={setInt('fractalMinSize')} /></td>
                    </tr>
                    <tr>
                        <td colspan="3">Fractal color gain (%)</td>
                        <td><TextInput value={props.settings.fractalColorGain} onChange={setInt('fractalColorGain')} /></td>
                    </tr>
                    <tr>
                        <td colspan="2"><Checkbox label="Blur nebula" value={props.settings.blurNebula} onChange={setBool('blurNebula')} /></td>
                        <td colspan="2"><Checkbox label="Blur fractal" value={props.settings.blurFractal} onChange={setBool('blurFractal')} /></td>
                    </tr>
                </tbody>
            </table>
        </div>    
    );
}

export default GenerateSettings;
