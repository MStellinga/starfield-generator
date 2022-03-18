import './style.css';
import {Canvas} from "./elements/canvas";
import React from "react";
import {Point} from "../model/Point";
import {ConfigurableItem} from "../model/ConfigurableItem";
import {ConfigurableItemUI} from "./settings/ConfigurableItemUI";
import {CanvasWidget} from "./elements/canvas-widget";
import {Starcluster, StarClusterType} from "../model/Starcluster";
import {Nebula, NebulaType} from "../model/Nebula";
import {Loader} from "./elements/loader";
import Slider from "rc-slider";
import {Renderer} from "../generator/Renderer";
import {RenderData} from "../generator/Generator";

type GeneratorUIState = {
    progress: number,
    shouldPaint: boolean,
    width: string,
    height: string,
    renderItems: Array<ConfigurableItem>,
    renderer: Renderer,
    idCounter: number,
    rendering: boolean,
    gasBlooming: number;
};

type PointID = {
    id: number,
    index: number;
}

const generator = new Worker(new URL('../generator/generator-worker', import.meta.url));

class GeneratorUI extends React.Component<{}, GeneratorUIState> {

    state: GeneratorUIState = {
        progress: 0,
        shouldPaint: false,
        width: "720",
        height: "480",
        renderItems: this.createInitialItems(),
        renderer: new Renderer(),
        idCounter: 4,
        rendering: false,
        gasBlooming: 40
    }

    createInitialItems() {
        let cluster1 = new Starcluster(0, [{x: 0, y: 0}, {x: 712, y: 480}])
        cluster1.clusterType = StarClusterType.RECTANGULAR;
        cluster1.brightness = 10;
        cluster1.blooming = 30;
        cluster1.nrOfStars = "800";
        let cluster2 = new Starcluster(1, [{x: 80, y: 130}, {x: 400, y: 160}, {x: 670, y: 385}]);
        cluster2.clusterType = StarClusterType.PATH;
        cluster2.minRadius = "50";
        cluster2.maxRadius = "150";
        cluster2.brightness = 35;
        cluster2.blooming = 40;
        cluster2.nrOfStars = "150";
        let nebula1 = new Nebula(2, [{x: 360, y: 240}])
        nebula1.nebulaType = NebulaType.CIRCULAR
        nebula1.nrOfSeeds = "10";
        nebula1.radius = "40"
        nebula1.minSeedRadius = "40"
        nebula1.maxSeedRadius = "80"
        nebula1.hue1 = 180;
        nebula1.hue2 = 180;
        let nebula2 = new Nebula(3, [{x: 360, y: 240}])
        nebula2.nebulaType = NebulaType.CIRCULAR
        nebula2.nrOfSeeds = "10";
        nebula2.radius = "80";
        nebula2.minSeedRadius = "80"
        nebula2.maxSeedRadius = "150"
        nebula2.hue1 = 0;
        nebula2.hue2 = 20;
        nebula2.brightness = 30;
        nebula2.cutOutAngle = 92;
        nebula2.cutOutSize = 30;
        nebula2.cutOutFade = 10;
        nebula2.hollowEmpty = 20;
        nebula2.hollowFull = 35;
        return [cluster1, cluster2, nebula1, nebula2];
    }

    componentDidMount() {
        generator.onmessage = (message: MessageEvent) => {
            if (message.data.logItem) {
                console.log(message.data.logItem)
            } else if (message.data) {
                this.state.renderer.updateData(RenderData.copyFromAny(message.data));
                this.setState({shouldPaint: true, rendering: false})
            }
        };
        generator.onerror = (error: ErrorEvent) => {
            console.log(error);
        }
        generator.postMessage({width: this.getWidth(), height: this.getHeight(), gasBlooming: this.state.gasBlooming})
    }

    setWidth(newValueAsString: string) {
        this.setState({
            width: newValueAsString
        }, () => {
            let newValue = parseInt(newValueAsString)
            if (!isNaN(newValue)) {
                generator.postMessage({
                    width: newValue
                })
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
                generator.postMessage({
                    height: newValue
                })
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
        let itemsToRender = this.state.renderItems.filter((item) => {
            return item.id === id || id === -1;
        });
        generator.postMessage({
            items: itemsToRender
        });
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
        this.performRender(-1)
        this.setState({rendering: true});
    }

    onRemoveSettings(id: number) {
        let newRenderItems = this.state.renderItems.filter((item) => {
            return item.id !== id
        });
        for (let i = 0; i < newRenderItems.length; i++) {
            newRenderItems[i].id = i;
        }
        generator.postMessage({reset: true})
        this.setState({renderItems: newRenderItems, idCounter: newRenderItems.length})
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
        generator.postMessage({gasBlooming: newValue})
        this.setState({gasBlooming: newValue})
    }

    onDonePainting() {
        this.setState({shouldPaint: false})
    }

    onHelp() {
        let newWindow = window.open('/help.html', '_blank');
        if (newWindow) {
            newWindow.focus();
        }
    }

    getWidth() {
        let wdt = parseInt(this.state.width);
        return isNaN(wdt) ? 712 : wdt
    }

    getHeight() {
        let ht = parseInt(this.state.height);
        return isNaN(ht) ? 480 : ht
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
                            <button className="highlight" onClick={() => {
                                this.onHelp()
                            }}>Help
                            </button>
                        </div>
                        <table>
                            <tbody>
                            <tr>
                                <td>Extra gas bloom:</td>
                                <td className="min-width-slider"><Slider value={this.state.gasBlooming}
                                                                         onChange={(val) => {
                                                                             this.onUpdateGasBlooming(val as number)
                                                                         }}/></td>
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
                        renderer={this.state.renderer}
                        donePainting={() => {
                            this.onDonePainting()
                        }}
                        width={this.getWidth()}
                        height={this.getHeight()}>
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