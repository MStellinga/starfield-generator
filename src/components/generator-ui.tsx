import './style.css';
import {Canvas} from "./elements/canvas";
import React from "react";
import {Point} from "../model/Point";
import {ConfigurableItem} from "../model/ConfigurableItem";
import {ConfigurableItemUI} from "./settings/ConfigurableItemUI";
import {CanvasWidget} from "./elements/canvas-widget";
import {Starcluster} from "../model/Starcluster";
import {Loader} from "./elements/loader";
import Slider from "rc-slider";
import {Renderer} from "../generator/Renderer";
import {RenderData} from "../generator/Generator";
import {generateSamples2, generateSamples3, generateSamples4} from "./samples";
import {Nebula} from "../model/Nebula";

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
    transparency: boolean;
};

type PointID = {
    id: number,
    index: number;
}

const ITEMCOUNT_KEY = "starfield.settings.count";
const ITEMBASE_KEY = "starfield.settings.";
const WIDTH_KEY = "starfield.settings.width";
const HEIGHT_KEY = "starfield.settings.height";
const BLOOMING_KEY = "starfield.settings.blooming";
const TRANSPARENCY_KEY = "starfield.settings.transparency";

const DEFAULT_WIDTH = 1024;
const DEFAULT_HEIGHT = 768;
const DEFAULT_TRANSPARENCY = false;
const DEFAULT_BLOOMING = 10;

const generator = new Worker(new URL('../generator/generator-worker', import.meta.url));

class GeneratorUI extends React.Component<{}, GeneratorUIState> {

    state: GeneratorUIState = {
        progress: 0,
        shouldPaint: false,
        width: "" + DEFAULT_WIDTH,
        height: "" + DEFAULT_HEIGHT,
        renderItems: [],
        renderer: new Renderer(),
        idCounter: 0,
        rendering: false,
        transparency: DEFAULT_TRANSPARENCY,
        gasBlooming: DEFAULT_BLOOMING
    }

    componentDidMount() {
        let renderItems: Array<ConfigurableItem> = this.loadItems();
        this.setState({renderItems: renderItems, idCounter: renderItems.length});
        let width = this.loadString(WIDTH_KEY, "" + DEFAULT_WIDTH);
        this.setState({width: width});
        let height = this.loadString(HEIGHT_KEY, "" + DEFAULT_HEIGHT);
        this.setState({height: height});
        let gasBlooming = this.loadInt(BLOOMING_KEY, DEFAULT_BLOOMING);
        this.setState({gasBlooming: gasBlooming});
        let transparency = this.loadBool(TRANSPARENCY_KEY)
        this.setState({transparency: transparency});

        generator.onmessage = (message: MessageEvent) => {
            if (message.data.logItem) {
                console.log(message.data.logItem)
            } else if (message.data) {
                // console.log(message.data)
                this.state.renderer.updateData(RenderData.copyFromAny(message.data));
                this.setState({shouldPaint: true, rendering: false})
            }
        };
        generator.onerror = (error: ErrorEvent) => {
            console.log(error);
        }
        generator.postMessage({
            width: this.getWidth(),
            height: this.getHeight(),
            gasBlooming: this.state.gasBlooming,
            transparency: this.state.transparency
        })
    }

    setWidth(newValueAsString: string) {
        this.state.renderItems.forEach((item) => {
            item.needsGenerate = true;
        })
        this.setState({
            width: newValueAsString
        }, () => {
            let newValue = parseInt(newValueAsString)
            if (!isNaN(newValue)) {
                window.localStorage.setItem(WIDTH_KEY, "" + newValue)
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
                window.localStorage.setItem(HEIGHT_KEY, "" + newValue)
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
            this.storeItems(newRenderItems);
            this.setState({renderItems: newRenderItems})
        } else {
            this.setState({renderItems: [...this.state.renderItems]}, () => {
                this.storeItems(this.state.renderItems);
            })
        }
    }

    loadInt(key: string, fallback: number) {
        try {
            let val = window.localStorage.getItem(key);
            let result = val == null ? fallback : parseInt(val);
            return isNaN(result) ? fallback : result;
        } catch (e) {
            console.log("failed to load " + key + "from local storage");
            return fallback;
        }
    }

    loadBool(key: string) {
        try {
            return window.localStorage.getItem(key) === "true";
        } catch (e) {
            console.log("failed to load " + key + "from local storage");
            return false;
        }
    }

    loadString(key: string, fallback: string) {
        try {
            let result = window.localStorage.getItem(key);
            return result == null ? fallback : result;
        } catch (e) {
            console.log("failed to load " + key + "from local storage");
            return fallback;
        }
    }

    loadItems() {
        let renderItems: Array<ConfigurableItem> = []
        try {
            let countS = window.localStorage.getItem(ITEMCOUNT_KEY);
            let count = countS == null ? 0 : parseInt(countS);
            if (count > 0) {
                for (let i = 0; i < count; i++) {
                    let json = window.localStorage.getItem(ITEMBASE_KEY + i);
                    if (json != null) {
                        let data = JSON.parse(json);
                        if (data.itemType == 0) {
                            renderItems.push(Starcluster.copyFromAny(data));
                        } else {
                            renderItems.push(Nebula.copyFromAny(data));
                        }
                    }
                }
            }
        } catch (e) {
            console.log("Failed to load items: " + e);
        }
        if (renderItems.length == 0) {
            renderItems = generateSamples4();
        }
        return renderItems
    }

    storeItems(renderItems: Array<ConfigurableItem>) {
        let idx = 0;
        renderItems.forEach((item) => {
            window.localStorage.setItem(ITEMBASE_KEY + idx, JSON.stringify(item));
            idx++;
        })
        window.localStorage.setItem(ITEMCOUNT_KEY, "" + idx);
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
        window.localStorage.setItem(BLOOMING_KEY, "" + newValue)
        generator.postMessage({gasBlooming: newValue})
        this.setState({gasBlooming: newValue})
    }

    onUpdateTransparency(newValue: boolean) {
        window.localStorage.setItem(TRANSPARENCY_KEY, "" + newValue)
        this.state.renderer.transparency = newValue;
        generator.postMessage({transparency: newValue})
        this.setState({transparency: newValue})
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
        return isNaN(wdt) ? DEFAULT_WIDTH : wdt
    }

    getHeight() {
        let ht = parseInt(this.state.height);
        return isNaN(ht) ? DEFAULT_HEIGHT : ht
    }

    render() {
        return (
            <div>
                <div className="container">
                    <Loader visible={this.state.rendering} showIcon={false}/>
                    <div className="section">
                        <table className="config-table">
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
                                this.setState({
                                    renderItems: generateSamples4()
                                }, () => {
                                    this.storeItems(this.state.renderItems);
                                    this.setWidth("" + DEFAULT_WIDTH);
                                    this.setHeight("" + DEFAULT_HEIGHT);
                                    this.onUpdateTransparency(DEFAULT_TRANSPARENCY);
                                    this.onUpdateGasBlooming(DEFAULT_BLOOMING);
                                })
                            }}>Default settings
                            </button>
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
                                <td><input type="checkbox" checked={this.state.transparency}
                                           onChange={(event) => {
                                               this.onUpdateTransparency(event.currentTarget.checked);
                                           }}/> Add transparency
                                </td>
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