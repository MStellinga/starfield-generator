import React from "react";
import {ConfigurableItem, ItemType} from "../../model/ConfigurableItem";
import {StarClusterConfigurationUI} from "./StarClusterConfigurationUI";
import {Starcluster} from "../../model/Starcluster";
import {Nebula} from "../../model/Nebula";
import {NebulaConfigurationUI} from "./NebulaConfigurationUI";

type ConfigurableItemUIProps = {
    settings: ConfigurableItem;
    updateSettingsCallback: Function;
    removeSettingsCallback: Function;
    renderCallback: Function;
};

class ConfigurableItemUI extends React.Component<ConfigurableItemUIProps, {}> {

    render() {
        if (this.props.settings?.getType() === ItemType.STARCLUSTER) {
            return <StarClusterConfigurationUI
                settings={this.props.settings as Starcluster}
                updateSettingsCallback={this.props.updateSettingsCallback}
                removeSettingsCallback={this.props.removeSettingsCallback}
                renderCallback={this.props.renderCallback}/>
        } else {
            return <NebulaConfigurationUI
                settings={this.props.settings as Nebula}
                updateSettingsCallback={this.props.updateSettingsCallback}
                removeSettingsCallback={this.props.removeSettingsCallback}
                renderCallback={this.props.renderCallback}/>
        }
    }

}

export {ConfigurableItemUI}