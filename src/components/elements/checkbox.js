import { h } from 'preact';
import style from './checkbox.css';

const Checkbox = (props) => (
    <div class={style.checkbox}>
        <input type="checkbox" checked={props.value} onChange={props.onChange} /><span>{props.label}</span>
    </div>
);

export default Checkbox;
