import {Point} from "../../model/Point";
import {PointID} from "../generator-ui";
import React from "react";
import './canvas-widget.css';

type CanvasWidgetProps = {
    id: PointID,
    center: Point
};

class CanvasWidget extends React.Component<CanvasWidgetProps, {}> {

    createStyle() {
        return {
            left: this.props.center.x,
            top: this.props.center.y
        }
    }

    onDragStart(event: React.DragEvent<HTMLDivElement>) {
        event.dataTransfer.setData('id', JSON.stringify(this.props.id));
    }

    getIdAsLetter() {
        if (this.props.id.id < 26) {
            return String.fromCharCode('A'.charCodeAt(0) + this.props.id.id);
        } else if (this.props.id.id < 52) {
            return String.fromCharCode('a'.charCodeAt(0) + this.props.id.id - 26);
        } else {
            return 'X';
        }
    }

    render() {
        return <div draggable="true" className="canvasCircle" style={this.createStyle()}
                    onDragStart={(event) => this.onDragStart(event)}>
            <div>{'' + this.getIdAsLetter() + (this.props.id.index + 1)}</div>
        </div>
    }
}

export {CanvasWidget}