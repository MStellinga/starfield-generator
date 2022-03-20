import './checkbox.css';
import React, {ChangeEventHandler} from "react";

type CheckboxProps = {
    value: boolean;
    onChange: ChangeEventHandler<HTMLInputElement>;
    label: String
};

const Checkbox = ({value, onChange, label}: CheckboxProps) =>
    <div className="checkbox">
        <input type="checkbox" checked={value} onChange={onChange}/><span>{label}</span>
    </div>;

export {Checkbox};
