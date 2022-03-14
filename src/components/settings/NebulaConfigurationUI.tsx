import React, {ChangeEvent} from "react";
import {Nebula} from "../../model/Nebula";
import {Starcluster} from "../../model/Starcluster";
import {ColorResult, HuePicker} from "react-color";


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
        expanded: true
    }

    onSwitchType(event: ChangeEvent<HTMLSelectElement>) {
        if (event.currentTarget.selectedIndex === 1) {
            let id = this.props.settings.id;
            let newSettings = new Starcluster(id, this.props.settings.points);
            this.props.updateSettingsCallback(newSettings);
        }
    }

    onChangeIntValue(property: string, newValue: string) {
        this.props.settings.setIntProperty(property, newValue)
        this.props.updateSettingsCallback(this.props.settings);
    }

    onChangeFloatValue(property: string, newValue: string) {
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

    onRender() {
        this.props.renderCallback()
    }

    onHueChange(color: ColorResult) {
        this.props.settings.setFloatProperty("hue", "" + color.hsl.h)
        this.props.updateSettingsCallback(this.props.settings);
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
                           this.onChangeIntValue("radius", event.currentTarget.value)
                       }}/></td>

            <td># Seeds</td>
            <td><input className="numberField" value={this.props.settings.nrOfSeeds} onChange={(event) => {
                this.onChangeIntValue("nrOfSeeds", event.currentTarget.value)
            }}/></td>

            <td>Seed radius:</td>
            <td><input className="numberField" value={this.props.settings.minSeedRadius}
                       onChange={(event) => {
                           this.onChangeIntValue("minSeedRadius", event.currentTarget.value)
                       }}/></td>
            <td>-</td>
            <td><input className="numberField" value={this.props.settings.maxSeedRadius}
                       onChange={(event) => {
                           this.onChangeIntValue("maxSeedRadius", event.currentTarget.value)
                       }}/></td>
            <td></td>
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
                    this.onRender()
                }}>Render
                </button>
            </td>
        </tr>
        <tr>

            <td># Fractals</td>
            <td><input className="numberField" value={this.props.settings.fractalCount}
                       onChange={(event) => {
                           this.onChangeIntValue("fractalCount", event.currentTarget.value)
                       }}/></td>

            <td>Shrink/step:</td>
            <td><input className="numberField" value={this.props.settings.minRadiusPart}
                       onChange={(event) => {
                           this.onChangeFloatValue("minRadiusPart", event.currentTarget.value)
                       }}/></td>
            <td>-</td>
            <td><input className="numberField" value={this.props.settings.maxRadiusPart}
                       onChange={(event) => {
                           this.onChangeFloatValue("maxRadiusPart", event.currentTarget.value)
                       }}/></td>

            <td>Divisions/step:</td>
            <td><input className="numberField" value={this.props.settings.subdivisionCount}
                       onChange={(event) => {
                           this.onChangeIntValue("subdivisionCount", event.currentTarget.value)
                       }}/></td>

            <td>Angle shift/step:</td>
            <td><input className="numberField" value={this.props.settings.minSeedRadius}
                       onChange={(event) => {
                           this.onChangeFloatValue("minAngleOffset", event.currentTarget.value)
                       }}/></td>
            <td>-</td>
            <td><input className="numberField" value={this.props.settings.maxSeedRadius}
                       onChange={(event) => {
                           this.onChangeIntValue("maxAngleOffset", event.currentTarget.value)
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
                <td colSpan={3}/>
                <td>{this.props.settings.canRemovePoints() && (<button onClick={() => {
                    this.deletePoint(index)
                }}>X</button>)}</td>
            </tr>
        })}
        {this.state.expanded && this.props.settings.canAddPoints() &&
            (<tr>
                <td/>
                <td>
                    <button onClick={() => {
                        this.onAddPoint()
                    }}>+
                    </button>
                </td>
                <td colSpan={8}/>
            </tr>)
        }
        <tr>
            <td>Hue:</td>
            <td colSpan={10}><HuePicker color={this.props.settings.getColor()} onChange={color => {
                this.onHueChange(color)
            }}/></td>
        </tr>
        </tbody>
    }

}

export {NebulaConfigurationUI}