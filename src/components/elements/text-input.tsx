import './text-input.css';
import {ChangeEventHandler} from "react";

type TextInputProps = {
    value: string | ReadonlyArray<string> | number | undefined
    onChange: ChangeEventHandler
};

const TextInput = ({value, onChange}: TextInputProps) =>
    <input type="text" pattern="-?[0-9\.]{1,5}" className="smallfield" value={value} onChange={onChange}/>
;

export default TextInput;
