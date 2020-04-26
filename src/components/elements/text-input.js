import { h } from 'preact';
import style from './text-input.css';

const TextInput = (props) => (
    <input type="text" pattern="-?[0-9\.]{1,5}" class={style.smallfield} value={props.value} onChange={props.onChange} />
);

export default TextInput;
