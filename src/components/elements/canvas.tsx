import './canvas.css';
import React, {CSSProperties, DragEvent, RefObject} from "react";
import {PointID} from "../generator-ui";
import {Loader} from "./loader";
import {Renderer} from "../../generator/Renderer";

enum Mode {
    VIEW,
    ADD,
    EDIT
}

type PictureProps = {
    addCallback: Function;
    setValueCallback: Function;
    donePainting: Function;
    shouldPaint: boolean;
    renderer: Renderer;
    width: number;
    height: number;
    loading: boolean;
}

type PictureState = {
    mode: Mode;
    starCanvas: RefObject<HTMLCanvasElement>;
    pictureData: string;
}

class Canvas extends React.Component<PictureProps, PictureState> {

    constructor(props: PictureProps) {
        super(props);
        this.state = {
            mode: Mode.VIEW,
            starCanvas: React.createRef(),
            pictureData: ''
        } as PictureState
        // document.addEventListener("dragstart", (event)=>{this.onDragStart(event)};
    }

    paintCanvas() {
        let canvas = this.state.starCanvas.current;
        if (canvas !== null) {
            this.props.renderer.paint(canvas.getContext("2d"));
            this.setState({
                pictureData: canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"),
            })
        }
    }

    componentDidUpdate() {
        if (this.props.shouldPaint) {
            this.paintCanvas();
            this.props.donePainting();
        }
    }

    onDragOver(event: DragEvent) {
        // Needed to trigger drop
        event.preventDefault();
    }

    onDrop(event: DragEvent) {
        let pointID: PointID = JSON.parse(event.dataTransfer.getData('id'));
        if (pointID) {
            let rect = (event.target as Element).getBoundingClientRect();
            let x = Math.round(event.clientX - rect.left);
            let y = Math.round(event.clientY - rect.top);
            this.props.setValueCallback(pointID.id, pointID.index, {x, y});
        }
    }

    onClick(event: React.MouseEvent<HTMLElement>) {
        if (this.state.mode === Mode.ADD) {
            let rect = event.currentTarget.getBoundingClientRect();
            let x = Math.round(event.clientX - rect.left);
            let y = Math.round(event.clientY - rect.top);
            this.props.addCallback({x: x, y: y});
        }
    }

    createStyle(addHeight: boolean) {
        let result = {width: this.props.width} as CSSProperties;
        if (addHeight) {
            result.height = this.props.height;
        }
        return result;
    }

    render() {
        return <div className="picture" style={this.createStyle(false)}>
            <Loader visible={this.props.loading} showIcon={true}/>
            <div className="pictureEditButtons">
                {((this.state.mode !== Mode.ADD && <button onClick={() => {
                    this.setState({mode: Mode.ADD})
                }}>Add</button>))}
                {((this.state.mode !== Mode.EDIT && <button onClick={() => {
                    this.setState({mode: Mode.EDIT})
                }}>Move</button>))}
                {((this.state.mode !== Mode.VIEW && <button onClick={() => {
                    this.setState({mode: Mode.VIEW})
                }}>Done</button>))}
            </div>
            {((this.state.mode === Mode.VIEW &&
                <canvas ref={this.state.starCanvas} width={this.props.width} height={this.props.height}
                        className="starcanvas"/>))}
            {((this.state.mode !== Mode.VIEW &&
                <div className="clusterEditor" data-mode={this.state.mode} style={this.createStyle(true)}
                     onDragOver={(event) => {
                         this.onDragOver(event)
                     }}
                     onDrop={(event) => {
                         this.onDrop(event)
                     }}
                     onClick={(event) => {
                         this.onClick(event)
                     }}>
                    {this.props.children}
                </div>
            ))}
            <div className="pictureEditButtons">
                <a href={this.state.pictureData} download="Starfield.png">
                    <button>Save to File</button>
                </a>
            </div>
        </div>
    }
}

export {Canvas};
