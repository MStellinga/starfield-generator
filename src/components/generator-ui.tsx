import './style.css';
import Progress from './elements/progress';
import {Canvas} from "./elements/canvas";
import React from "react";
import {Point} from "../model/Point";
import {Generator} from "../generator/Generator";
import {ConfigurableItem, ItemType} from "../model/ConfigurableItem";
import {ConfigurableItemUI} from "./settings/ConfigurableItemUI";
import {CanvasWidget} from "./elements/canvas-widget";
import {Starcluster, StarClusterType} from "../model/Starcluster";

type GeneratorUIState = {
    progress: number,
    shouldPaint: boolean,
    width: number,
    height: number,
    renderItems: Array<ConfigurableItem>,
    generator: Generator,
    idCounter: number
};

type PointID = {
    id: number,
    index: number;
}

class GeneratorUI extends React.Component<{}, GeneratorUIState> {

    state: GeneratorUIState = {
        progress: 0,
        shouldPaint: false,
        width: 720,
        height: 480,
        renderItems: this.createInitialItems(),
        generator: new Generator(720, 480),
        idCounter: 2
    }

    createInitialItems() {
        let cluster1 = new Starcluster(0, [{x: 0, y: 0}, {x: 712, y: 480}])
        cluster1.clusterType = StarClusterType.RECTANGULAR;
        cluster1.maxBrightness = 150;
        cluster1.blooming = 130;
        cluster1.nrOfStars = 500;
        let cluster2 = new Starcluster(1, [{x: 360, y: 240}]);
        cluster2.clusterType = StarClusterType.CIRCULAR;
        cluster2.minRadius = 200;
        cluster2.maxRadius = 300;
        cluster2.maxBrightness = 400;
        cluster2.blooming = 170;
        cluster2.nrOfStars = 100;
        return [cluster1, cluster2];
    }

    onUpdateCanvasItem(id: number, index: number, point: Point) {
        let found = false
        for (let i = 0; i < this.state.renderItems.length; i++) {
            if (this.state.renderItems[i].id === id) {
                let target: ConfigurableItem = this.state.renderItems[i]
                target.setPoint(index, point)
                found = true;
                break;
            }
        }
        if (found) {
            this.onSettingsUpdated(id);
        }
    }

    onSettingsUpdated(id: number, newSettings: ConfigurableItem | null = null) {
        if (newSettings != null) {
            let newRenderItems = []
            for (let i = 0; i < this.state.renderItems.length; i++) {
                if (this.state.renderItems[i].id === id) {
                    newRenderItems.push(newSettings)
                } else {
                    newRenderItems.push(this.state.renderItems[i])
                }
            }
            this.setState({renderItems: newRenderItems})
        } else {
            this.setState({renderItems: [...this.state.renderItems]})
        }
    }

    onRender(id: number) {
        for (let i = 0; i < this.state.renderItems.length; i++) {
            if (this.state.renderItems[i].id === id) {
                if (this.state.renderItems[i].getType() === ItemType.STARCLUSTER) {
                    this.state.generator.renderStars(i, this.state.renderItems[i] as Starcluster);
                    this.setState({shouldPaint: true});
                }
                break;
            }
        }
    }

    onRemoveSettings(id: number) {
        let newRenderItems = []
        for (let i = 0; i < this.state.renderItems.length; i++) {
            if (this.state.renderItems[i].id !== id) {
                newRenderItems.push(this.state.renderItems[i])
            }
        }
        this.setState({renderItems: newRenderItems})
    }

    onAddCanvasItem(point: Point) {
        let id = this.state.idCounter;
        this.setState({
            idCounter: id + 1
        })
        let newSettings = new Starcluster(id, [point])
        this.setState(prevState => ({
            renderItems: [...prevState.renderItems, newSettings]
        }))
    }

    onDonePainting() {
        this.setState({shouldPaint: false})
    }

    render() {
        return (
            <div>
                <div className="container">

                    <div className="section">
                        <table>
                            {this.state.renderItems.map(item => {
                                return <ConfigurableItemUI
                                    key={"" + item.id + "-" + item.counter}
                                    settings={item}
                                    updateSettingsCallback={(newSettings: ConfigurableItem | null) => {
                                        this.onSettingsUpdated(item.id, newSettings)
                                    }}
                                    removeSettingsCallback={() => {
                                        this.onRemoveSettings(item.id)
                                    }}
                                    renderCallback={() => {
                                        this.onRender(item.id)
                                    }}
                                />
                            })}
                        </table>


                    </div>

                    <Progress progress={this.state.progress}/>
                </div>
                <Canvas setValueCallback={(id: number, index: number, point: Point) => {
                    this.onUpdateCanvasItem(id, index, point)
                }}
                        addCallback={(point: Point) => {
                            this.onAddCanvasItem(point)
                        }}
                        shouldPaint={this.state.shouldPaint}
                        generator={this.state.generator}
                        donePainting={() => {
                            this.onDonePainting()
                        }} width={this.state.width} height={this.state.height}>
                    {this.state.renderItems.map(item => {
                        return item.getPointsToRender().map((point, index) => {
                            return <CanvasWidget
                                key={item.id + '-' + item.counter + '-' + index + '-' + point.x + '|' + point.y}
                                id={{id: item.id, index: index}} center={point} backgroundColor={item.getColor()}/>
                        })
                    })}
                </Canvas>
            </div>
        );
    }
}

export type {PointID};
export {GeneratorUI};