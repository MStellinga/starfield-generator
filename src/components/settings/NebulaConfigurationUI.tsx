import React, {ChangeEvent} from "react";
import {Nebula} from "../../model/Nebula";
import {Starcluster} from "../../model/Starcluster";
import {ColorResult, HuePicker} from "react-color";
import Slider from "rc-slider";
import 'rc-slider/assets/index.css';

type NebulaConfigurationUIProps = {
    settings: Nebula;
    updateSettingsCallback: Function;
    removeSettingsCallback: Function;
    renderCallback: Function;
};

type NebulaConfigurationUIState = {
    expanded: boolean
}

class NebulaConfigurationUI extends React.Component<NebulaConfigurationUIProps, NebulaConfigurationUIState> {

    state: NebulaConfigurationUIState = {
        expanded: false
    }

    onSwitchType(event: ChangeEvent<HTMLSelectElement>) {
        if (event.currentTarget.selectedIndex === 1) {
            let id = this.props.settings.id;
            let newSettings = new Starcluster(id, this.props.settings.points);
            this.props.updateSettingsCallback(newSettings);
        }
    }

    onChangeValue(property: string, newValue: string) {
        this.props.settings.setProperty(property, newValue)
        this.props.updateSettingsCallback(this.props.settings);
    }

    onChangeIntValue(property: string, newValue: string | number) {
        this.props.settings.setIntProperty(property, newValue)
        this.props.updateSettingsCallback(this.props.settings);
    }

    onChangeIntValues(properties: Array<any>) {
        properties.forEach((prop) => {
            this.props.settings.setIntProperty(prop.prop, prop.val);
        })
        this.props.updateSettingsCallback(this.props.settings);
    }

    onChangeFloatValue(property: string, newValue: string | number) {
        this.props.settings.setFloatProperty(property, newValue)
        this.props.updateSettingsCallback(this.props.settings);
    }

    deleteSelf() {
        this.props.removeSettingsCallback();
    }

    deletePoint(index: number) {
        this.props.settings.removePoint(index)
        this.props.updateSettingsCallback(this.props.settings);
    }

    onAddPoint() {
        this.props.settings.addPoint()
        this.props.updateSettingsCallback(this.props.settings);
    }

    onChangePointX(index: number, newValue: string) {
        let newSettings = this.props.settings.copy()
        let newX = newValue === '' ? 0 : parseInt(newValue);
        if (isNaN(newX)) {
            return
        }
        let newPoint = {x: newX, y: newSettings.points[index].y}
        newSettings.setPoint(index, newPoint)
        this.props.updateSettingsCallback(newSettings);
    }

    onChangePointY(index: number, newValue: string) {
        let newSettings = this.props.settings.copy()
        let newY = newValue === '' ? 0 : parseInt(newValue);
        if (isNaN(newY)) {
            return
        }
        let newPoint = {x: newSettings.points[index].x, y: newY}
        newSettings.setPoint(index, newPoint)
        this.props.updateSettingsCallback(newSettings);
    }

    onRender(forceGenerate: boolean) {
        if (forceGenerate) {
            this.props.settings.needsGenerate = true;
        }
        this.props.renderCallback()
    }

    onHue1Change(color: ColorResult) {
        this.props.settings.setFloatProperty("hue1", "" + color.hsl.h)
        this.props.updateSettingsCallback();
    }

    onHue2Change(color: ColorResult) {
        this.props.settings.setFloatProperty("hue2", "" + color.hsl.h)
        this.props.updateSettingsCallback();
    }

    onHueChanged() {
        this.props.renderCallback()
    }

    getIdAsLetter() {
        if (this.props.settings.id < 26) {
            return String.fromCharCode('A'.charCodeAt(0) + this.props.settings.id);
        } else if (this.props.settings.id < 52) {
            return String.fromCharCode('a'.charCodeAt(0) + this.props.settings.id - 26);
        } else {
            return 'X';
        }
    }

    render() {
        return <tbody>
        <tr className="topSectionRow">
            <td>
                {this.getIdAsLetter()}
                <select onChange={(event) => {
                    this.onSwitchType(event)
                }} defaultValue="Nebula">
                    <option>Nebula</option>
                    <option>Stars</option>
                </select>
            </td>
            <td>
                <select onChange={(event) => {
                    this.onChangeIntValue("nebulaType", event.currentTarget.value)
                }} defaultValue={this.props.settings.nebulaType}>
                    <option value="0">Circle</option>
                    <option value="1">Path</option>
                </select>
            </td>

            <td colSpan={3}>Gen radius:</td>
            <td><input className="numberField" value={this.props.settings.radius}
                       onChange={(event) => {
                           this.onChangeValue("radius", event.currentTarget.value)
                       }}/></td>

            <td># Seeds</td>
            <td><input className="numberField" value={this.props.settings.nrOfSeeds} onChange={(event) => {
                this.onChangeValue("nrOfSeeds", event.currentTarget.value)
            }}/></td>

            <td>Seed radius:</td>
            <td><input className="numberField" value={this.props.settings.minSeedRadius}
                       onChange={(event) => {
                           this.onChangeValue("minSeedRadius", event.currentTarget.value)
                       }}/></td>
            <td>-</td>
            <td><input className="numberField" value={this.props.settings.maxSeedRadius}
                       onChange={(event) => {
                           this.onChangeValue("maxSeedRadius", event.currentTarget.value)
                       }}/></td>
            <td>
                <button
                    onClick={() => this.setState({expanded: !this.state.expanded})}>{this.state.expanded ? '^' : 'V'}</button>
            </td>
            <td>
                <button onClick={() => {
                    this.deleteSelf()
                }}>X
                </button>
            </td>
            <td>
                <button onClick={() => {
                    this.onRender(true)
                }}>Generate
                </button>
            </td>
        </tr>
        <tr>

            <td># Fractals</td>
            <td><input className="numberField" value={this.props.settings.fractalCount}
                       onChange={(event) => {
                           this.onChangeValue("fractalCount", event.currentTarget.value)
                       }}/></td>

            <td>Shrink/step:</td>
            <td><input className="numberField" value={this.props.settings.minRadiusPart}
                       onChange={(event) => {
                           this.onChangeValue("minRadiusPart", event.currentTarget.value)
                       }}/></td>
            <td>-</td>
            <td><input className="numberField" value={this.props.settings.maxRadiusPart}
                       onChange={(event) => {
                           this.onChangeValue("maxRadiusPart", event.currentTarget.value)
                       }}/></td>

            <td>Divisions/step:</td>
            <td><input className="numberField" value={this.props.settings.subdivisionCount}
                       onChange={(event) => {
                           this.onChangeValue("subdivisionCount", event.currentTarget.value)
                       }}/></td>

            <td>Angle shift/step:</td>
            <td><input className="numberField" value={this.props.settings.minAngleOffset}
                       onChange={(event) => {
                           this.onChangeValue("minAngleOffset", event.currentTarget.value)
                       }}/></td>
            <td>-</td>
            <td><input className="numberField" value={this.props.settings.maxAngleOffset}
                       onChange={(event) => {
                           this.onChangeValue("maxAngleOffset", event.currentTarget.value)
                       }}/></td>
        </tr>
        {this.state.expanded && this.props.settings.getPointsToRender().map((pt, index) => {
            return <tr key={'' + index}>
                <td></td>
                <td>{index + 1}</td>
                <td>X:</td>
                <td><input className="numberField" value={pt.x} onChange={(event) => {
                    this.onChangePointX(index, event.currentTarget.value)
                }}/></td>
                <td>Y:</td>
                <td><input className="numberField" value={pt.y} onChange={(event) => {
                    this.onChangePointY(index, event.currentTarget.value)
                }}/></td>
                <td className="pushLeft">{this.props.settings.canRemovePoints() && (<button onClick={() => {
                    this.deletePoint(index)
                }}>X</button>)}</td>
            </tr>
        })}
        {this.state.expanded && this.props.settings.canAddPoints() &&
            (<tr>
                <td colSpan={6}/>
                <td className="pushLeft">
                    <button onClick={() => {
                        this.onAddPoint()
                    }}>+
                    </button>
                </td>
            </tr>)
        }
        <tr>
            <td>Hue 1:</td>
            <td colSpan={6}><HuePicker color={this.props.settings.getHue1()} onChange={color => {
                this.onHue1Change(color)
            }}/></td>
            <td colSpan={2}>Hue points:</td>
            <td colSpan={6}><Slider range={true} count={1}
                                    value={[this.props.settings.hue1Fraction, this.props.settings.hue2Fraction]}
                                    onChange={(newValue) => {
                                        let vals = newValue as Array<number>;
                                        this.onChangeIntValues([{
                                            prop: "hue1Fraction",
                                            val: vals[0]
                                        }, {prop: "hue2Fraction", val: vals[1]}]);
                                    }}
                                    onAfterChange={() => this.onRender(false)}/></td>
        </tr>
        <tr>
            <td>Hue 2:</td>
            <td colSpan={6}><HuePicker color={this.props.settings.getHue2()} onChange={color => {
                this.onHue2Change(color)
            }}/></td>
            <td colSpan={2}>Hollow center:</td>
            <td colSpan={6}><Slider range={true} count={1}
                                    value={[this.props.settings.hollowEmpty, this.props.settings.hollowFull]}
                                    onChange={(newValue) => {
                                        let vals = newValue as Array<number>;
                                        this.onChangeIntValues([{
                                            prop: "hollowEmpty",
                                            val: vals[0]
                                        }, {prop: "hollowFull", val: vals[1]}]);
                                    }}
                                    onAfterChange={() => this.onRender(false)}/></td>
        </tr>
        <tr>
            <td>Brightness:</td>
            <td colSpan={4}><Slider value={this.props.settings.brightness}
                                    onChange={(newValue) => {
                                        this.onChangeIntValue("brightness", newValue as number)
                                    }}
                                    onAfterChange={() => this.onRender(false)}/></td>
            <td>Smooth:</td>
            <td colSpan={2}><Slider value={this.props.settings.smooth}
                                    onChange={(newValue) => {
                                        this.onChangeIntValue("smooth", newValue as number)
                                    }}
                                    onAfterChange={() => this.onRender(false)}/></td>
            <td colSpan={1}>Fade:</td>
            <td colSpan={6}><Slider range={true} count={1}
                                    value={[this.props.settings.innerFade, this.props.settings.outerFade]}
                                    onChange={(newValue) => {
                                        let vals = newValue as Array<number>;
                                        this.onChangeIntValues([{prop: "innerFade", val: vals[0]}, {
                                            prop: "outerFade",
                                            val: vals[1]
                                        }]);
                                    }}
                                    onAfterChange={() => this.onRender(false)}/></td>
        </tr>
        </tbody>
    }

}

export {NebulaConfigurationUI}