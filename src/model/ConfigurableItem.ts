import {Point} from "./Point";

enum ItemType {
    STARCLUSTER,
    NEBULA
}

abstract class ConfigurableItem {

    id: number;
    counter: number;
    needsGenerate: boolean = true;
    active: boolean = true;
    expanded: boolean = false;
    itemType: number = -1;

    protected constructor(id: number) {
        this.id = id;
        this.counter = 0
    }

    abstract setPoint(index: number, point: Point): void;

    abstract getType(): ItemType;

    abstract getPointsToRender(): Array<Point>

    setBoolProperty(property: string, newValue: boolean) {
        switch (property) {
            case 'expanded':
                this.expanded = newValue;
                break;
        }
    }

}

export {ConfigurableItem, ItemType}