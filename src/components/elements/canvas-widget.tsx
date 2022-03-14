import {Point} from "../../model/Point";
import {PointID} from "../generator-ui";
import {RGBColor} from "react-color";
import React from "react";
import './canvas-widget.css';

type CanvasWidgetProps = {
    id: PointID,
    center: Point
    backgroundColor: RGBColor
};

class CanvasWidget extends React.Component<CanvasWidgetProps, {}> {

    createStyle() {
        let color = this.props.backgroundColor
        return {
            left: this.props.center.x,
            top: this.props.center.y,
            backgroundColor: `rgb(${color.r},${color.g},${color.b})`
        }
    }

    onDragStart(event: React.DragEvent<HTMLDivElement>) {
        event.dataTransfer.setData('id', JSON.stringify(this.props.id));
    }

    render() {
        return <div draggable="true" className="canvasCircle" style={this.createStyle()}
                    onDragStart={(event) => this.onDragStart(event)}>
            <div>{this.props.id.index + 1}</div>
        </div>
    }
}

export {CanvasWidget}