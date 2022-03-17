import {Point} from "./Point";
import {RGBColor} from "react-color";

enum ItemType {
    STARCLUSTER,
    NEBULA
}

abstract class ConfigurableItem {

    id: number;
    counter: number;
    needsGenerate: boolean = true;

    protected constructor(id: number) {
        this.id = id;
        this.counter = 0
    }

    abstract setPoint(index: number, point: Point): void;

    abstract getType(): ItemType;

    abstract getPointsToRender(): Array<Point>

}

export {ConfigurableItem, ItemType}