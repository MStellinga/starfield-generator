import {Point} from "../model/Point";
import {Generator} from "./Generator";
import {ConfigurableItem} from "../model/ConfigurableItem";
import {Starcluster} from "../model/Starcluster";
import {Nebula} from "../model/Nebula";

const generator = new Generator();

function copyToItemType(item: any) {
    let result: ConfigurableItem
    if (item.itemType === 1) {
        result = Nebula.copyFromAny(item);
    } else { // Star cluster
        result = Starcluster.copyFromAny(item)
    }
    result.needsGenerate = item.needsGenerate
    result.counter = item.counter;
    result.active = item.active;
    return result;
}

self.onmessage = ({data: {width, height, gasBlooming, items, reset}}) => {
    try {
        if (width) {
            generator.setWidth(width);
        }
        if (height) {
            generator.setHeight(height);
        }
        if (gasBlooming) {
            generator.setGasBlooming(gasBlooming);
        }
        if (items) {
            items.forEach((item: ConfigurableItem) => {
                let item2 = copyToItemType(item);
                generator.generateOrRender(item2);
            })
            let newData = generator.getData();
            postMessage(newData);
        }
        if (reset) {
            generator.clearAllLayers();
        }
    } catch (e: any) {
        self.postMessage({logItem: "" + e})
        if (e.stackTrace) {
            let st = e.stackTrace as Array<any>;
            st.forEach((line) => {
                self.postMessage({logItem: "" + line})
            })
        }
    }


};