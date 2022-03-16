import './style.css';
import {Canvas} from "./elements/canvas";
import React from "react";
import {Point} from "../model/Point";
import {Generator} from "../generator/Generator";
import {ConfigurableItem} from "../model/ConfigurableItem";
import {ConfigurableItemUI} from "./settings/ConfigurableItemUI";
import {CanvasWidget} from "./elements/canvas-widget";
import {Starcluster, StarClusterType} from "../model/Starcluster";
import {Nebula, NebulaType} from "../model/Nebula";
import {Loader} from "./elements/loader";
import Slider from "rc-slider";

type GeneratorUIState = {
    progress: number,
    shouldPaint: boolean,
    width: string,
    height: string,
    renderItems: Array<ConfigurableItem>,
    generator: Generator,
    idCounter: number,
    rendering: boolean,
    gasBlooming: number;
};

type PointID = {
    id: number,
    index: number;
}

class GeneratorUI extends React.Component<{}, GeneratorUIState> {

    state: GeneratorUIState = {
        progress: 0,
        shouldPaint: false,
        width: "720",
        height: "480",
        renderItems: this.createInitialItems(),
        generator: new Generator(720, 480),
        idCounter: 3,
        rendering: false,
        gasBlooming: 60
    }

    createInitialItems() {
        let cluster1 = new Starcluster(0, [{x: 0, y: 0}, {x: 712, y: 480}])
        cluster1.clusterType = StarClusterType.RECTANGULAR;
        cluster1.brightness = 10;
        cluster1.blooming = 50;
        cluster1.nrOfStars = 800;
        let cluster2 = new Starcluster(1, [{x: 360, y: 240}]);
        cluster2.clusterType = StarClusterType.CIRCULAR;
        cluster2.minRadius = 200;
        cluster2.maxRadius = 300;
        cluster2.brightness = 40;
        cluster2.blooming = 70;
        cluster2.nrOfStars = 100;
        let nebula1 = new Nebula(2, [{x: 105, y: 150}, {x: 400, y: 160}, {x: 620, y: 265}])
        nebula1.nebulaType = NebulaType.PATH
        return [cluster1, cluster2, nebula1];
    }

    setWidth(newValueAsString: string) {
        this.setState({
            width: newValueAsString
        }, () => {
            let newValue = parseInt(newValueAsString)
            if (!isNaN(newValue)) {
                this.state.generator.setSize(newValue, this.state.generator.height);
                this.setState({shouldPaint: true});
            }
        });
    }

    setHeight(newValueAsString: string) {
        this.setState({
            height: newValueAsString
        }, () => {
            let newValue = parseInt(newValueAsString)
            if (!isNaN(newValue)) {
                this.state.generator.setSize(this.state.generator.width, newValue);
                this.setState({shouldPaint: true});
            }
        });
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

    performRender(id: number) {
        this.state.renderItems
            .filter((item) => {
                return item.id === id || id === -1;
            })
            .forEach((item => {
                this.state.generator.generateOrRender(item);
            }));
        this.setState({shouldPaint: true, rendering: false});
    }

    onRender(id: number) {
        this.setState(
            {rendering: true},
            () => {
                setTimeout(() => {
                    this.performRender(id);
                }, 10)
            }
        );
    }

    onRenderAll() {
        this.setState(
            {rendering: true},
            () => {
                setTimeout(() => {
                    this.performRender(-1);
                }, 10)
            }
        );
    }

    onRemoveSettings(id: number) {
        let newRenderItems = this.state.renderItems.filter((item) => {
            return item.id !== id
        });
        for (let i = 0; i < newRenderItems.length; i++) {
            newRenderItems[i].id = i;
        }
        this.state.generator.clearAllLayers();
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

    onUpdateGasBlooming(newValue: number) {
        this.state.generator.gasBlooming = newValue;
        this.setState({gasBlooming: newValue, shouldPaint: true})
    }

    onDonePainting() {
        this.setState({shouldPaint: false})
    }

    render() {
        return (
            <div>
                <div className="container">
                    <Loader visible={this.state.rendering} showIcon={false}/>
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
                    <div className="section">
                        <div className="right">
                            <button onClick={() => {
                                this.onRenderAll()
                            }}>Render all
                            </button>
                            <br/>
                            <button className="highlight">Help</button>
                        </div>
                        <table>
                            <tbody>
                            <tr>
                                <td>Gas fog effect:</td>
                                <td colSpan={3}><Slider value={this.state.gasBlooming} onChange={(val) => {
                                    this.onUpdateGasBlooming(val as number)
                                }}/></td>
                            </tr>
                            <tr>
                                <td>Image width:</td>
                                <td><input className="numberField" value={this.state.width} onChange={(event) => {
                                    this.setWidth(event.currentTarget.value);
                                }}/></td>
                                <td>- height:</td>
                                <td><input className="numberField" value={this.state.height} onChange={(event) => {
                                    this.setHeight(event.currentTarget.value);
                                }}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <Canvas setValueCallback={(id: number, index: number, point: Point) => {
                    this.onUpdateCanvasItem(id, index, point)
                }}
                        loading={this.state.rendering}
                        addCallback={(point: Point) => {
                            this.onAddCanvasItem(point)
                        }}
                        shouldPaint={this.state.shouldPaint}
                        generator={this.state.generator}
                        donePainting={() => {
                            this.onDonePainting()
                        }}
                        width={this.state.generator.width}
                        height={this.state.generator.height}>
                    {this.state.renderItems.map(item => {
                        return item.getPointsToRender().map((point, index) => {
                            return <CanvasWidget
                                key={item.id + '-' + item.counter + '-' + index + '-' + point.x + '|' + point.y}
                                id={{id: item.id, index: index}} center={point}/>
                        })
                    })}
                </Canvas>
            </div>
        );
    }
}

export type {PointID};
export {GeneratorUI};