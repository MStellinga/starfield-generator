import {ColorResult, RGBColor, SketchPicker} from 'react-color'
import './color-picker.css';
import React from "react";

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

type ColorPickerProps = {
    color: RGBColor
    onChange: Function
};

type ColorPickerState = {
    show: boolean
};

class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState> {

    state: ColorPickerState = {
        show: false
    }

    handleClick() {
        let newValue = !this.state.show;
        this.setState({show: newValue});
    }

    handleClose() {
        this.setState({show: false});
    }

    handleChange(color: ColorResult) {
        this.props.onChange(color);
    }

    colorToCSS() {
        return {'background-color': `rgb(${this.props.color.r},${this.props.color.g},${this.props.color.b})`};
    }

    render() {
        return (
            <div>
                <div onClick={this.handleClick} className="pickerButton"
                     style={this.colorToCSS() as React.CSSProperties}/>
                {this.state.show ? <div style={popover as React.CSSProperties}>
                    <div style={cover as React.CSSProperties} onClick={this.handleClose}/>
                    <SketchPicker color={this.props.color} onChange={this.handleChange}/>
                </div> : null}
            </div>
        );
    }
}

export default ColorPicker;