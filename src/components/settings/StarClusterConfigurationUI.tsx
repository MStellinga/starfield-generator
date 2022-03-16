import React, {ChangeEvent} from "react";
import {Starcluster, StarClusterType} from "../../model/Starcluster";
import {Nebula} from "../../model/Nebula";
import Slider from "rc-slider";

type StarClusterConfigurationUIProps = {
    settings: Starcluster;
    updateSettingsCallback: Function;
    removeSettingsCallback: Function;
    renderCallback: Function;
};

type StarClusterConfigurationUIState = {
    expanded: boolean
}

class StarClusterConfigurationUI extends React.Component<StarClusterConfigurationUIProps, StarClusterConfigurationUIState> {

    state: StarClusterConfigurationUIState = {
        expanded: false
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

    onSwitchType(event: ChangeEvent<HTMLSelectElement>) {
        if (event.currentTarget.selectedIndex === 0) {
            let id = this.props.settings.id;
            let newSettings = new Nebula(id, this.props.settings.points);
            this.props.updateSettingsCallback(newSettings);
        }
    }

    onAddPoint() {
        this.props.settings.addPoint()
        this.props.updateSettingsCallback();
    }

    onChangeValue(property: string, newValue: string) {
        this.props.settings.setProperty(property, newValue)
        this.props.updateSettingsCallback();
    }

    onChangeIntValue(property: string, newValue: string | number) {
        this.props.settings.setIntProperty(property, newValue)
        this.props.updateSettingsCallback();
    }

    deleteSelf() {
        this.props.removeSettingsCallback();
    }

    deletePoint(index: number) {
        this.props.settings.removePoint(index)
        this.props.updateSettingsCallback();
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
        if(forceGenerate) {
            this.props.settings.needsGenerate = true;
        }
        this.props.renderCallback()
    }

    showRadius() {
        return this.props.settings.clusterType !== StarClusterType.RECTANGULAR;
    }


    render() {
        return <tbody>
        <tr className="topSectionRow">
            <td>
                {this.getIdAsLetter()}
                <select onChange={(event) => {
                    this.onSwitchType(event)
                }} defaultValue="Stars">
                    <option>Nebula</option>
                    <option>Stars</option>
                </select>
            </td>
            <td>
                <select onChange={(event) => {
                    this.onChangeIntValue("clusterType", event.currentTarget.value)
                }} defaultValue={this.props.settings.clusterType}>
                    <option value="0">Circle</option>
                    <option value="1">Rect</option>
                    <option value="2">Path</option>
                </select>
            </td>

            {this.showRadius() && (<td>Gen radius:</td>)}
            {this.showRadius() && (<td><input className="numberField" value={this.props.settings.minRadius}
                                              onChange={(event) => {
                                                  this.onChangeValue("minRadius", event.currentTarget.value)
                                              }}/></td>)}
            {this.showRadius() && (<td>-</td>)}
            {this.showRadius() && (<td><input className="numberField" value={this.props.settings.maxRadius}
                                              onChange={(event) => {
                                                  this.onChangeValue("maxRadius", event.currentTarget.value)
                                              }}/></td>)}

            <td>#</td>
            <td><input className="numberField" value={this.props.settings.nrOfStars} onChange={(event) => {
                this.onChangeValue("nrOfStars", event.currentTarget.value)
            }}/></td>

            {!this.showRadius() && (<td colSpan={4}/>)}

            <td colSpan={4}/>

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
            <td>Brightness:</td>
            <td colSpan={5}><Slider value={this.props.settings.brightness}
                                    onChange={(newValue) => {
                                        this.onChangeIntValue("brightness", newValue as number)
                                    }}
                                    onAfterChange={() => this.onRender(false)} /></td>
            <td>Bloom:</td>
            <td colSpan={5}><Slider value={this.props.settings.blooming}
                                    onChange={(newValue) => {
                                        this.onChangeIntValue("blooming", newValue as number)
                                    }}
                                    onAfterChange={() => this.onRender(false)} /></td>
        </tr>
        </tbody>
    }

}

export {StarClusterConfigurationUI}