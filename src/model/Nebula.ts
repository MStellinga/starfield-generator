import {RGBColor} from "react-color";
import {Point} from "./Point";
import {hslToRgb} from "../util/colorUtil";
import {ConfigurableItem, ItemType} from "./ConfigurableItem";
import {generateRandomPointAlongPath, generateRandomPointInCircle, toRange} from "../util/mathHelper";

enum NebulaType {
    // Seeds between minRadius and maxRadius around central point[0]
    CIRCULAR,
    // Seeds between minRadius and maxRadius from the lines created by the points
    PATH
}


class NebulaBubble {

    center: Point;
    radius: number;

    constructor(center: Point, radius: number) {
        this.center = center;
        this.radius = radius;
    }
}

class Nebula extends ConfigurableItem {

    points: Array<Point>;

    nrOfSeeds = 10;

    radius = 100;

    minSeedRadius = 100;
    maxSeedRadius = 150;

    hue: number = 200;
    nebulaType: NebulaType;

    minRadiusPart: number = 0.5;
    maxRadiusPart: number = 0.9;

    minAngleOffset: number = -1;
    maxAngleOffset: number = 1;

    fractalCount: number = 10;
    subdivisionCount: number = 5;

    constructor(id: number, points: Array<Point>) {
        super(id)
        this.points = points;
        this.nebulaType = NebulaType.CIRCULAR;
    }

    copy(): Nebula {
        let copy = new Nebula(this.id, this.points);
        copy.nrOfSeeds = this.nrOfSeeds;
        copy.radius = this.radius;
        copy.minSeedRadius = this.minSeedRadius;
        copy.maxSeedRadius = this.maxSeedRadius;
        copy.hue = this.hue;
        copy.nebulaType = this.nebulaType;
        copy.minRadiusPart = this.minRadiusPart;
        copy.maxRadiusPart = this.maxRadiusPart;
        copy.minAngleOffset = this.minAngleOffset;
        copy.maxAngleOffset = this.maxAngleOffset;
        copy.fractalCount = this.fractalCount;
        copy.subdivisionCount = this.subdivisionCount;
        return copy;
    }

    setPoint(index: number, point: Point) {
        if (index >= 0 && index < this.points.length) {
            this.points[index] = point;
        }
    }


    addPoint() {
        let newPoint = {x: this.points[this.points.length - 1].x + 20, y: this.points[this.points.length - 1].y + 20}
        this.points.push(newPoint);
        this.counter++;
    }

    removePoint(index: number) {
        this.points.splice(index, 1)
        this.counter++;
    }

    getColor(): RGBColor {
        let rgb = hslToRgb(this.hue, 255, 255)
        return {r: rgb[0], g: rgb[1], b: rgb[2]}
    }

    getType() {
        return ItemType.NEBULA
    }


    getPointsToRender(): Array<Point> {
        switch (this.nebulaType) {
            case NebulaType.CIRCULAR:
                return [this.points[0]];
            case NebulaType.PATH:
                return this.points
        }
    }

    canAddPoints(): boolean {
        switch (this.nebulaType) {
            case NebulaType.CIRCULAR:
                return this.points.length === 0;
            case NebulaType.PATH:
                return true;
        }
    }

    canRemovePoints(): boolean {
        switch (this.nebulaType) {
            case NebulaType.CIRCULAR:
                return false;
            case NebulaType.PATH:
                return this.points.length > 1;
        }
    }

    setIntProperty(property: string, newValue: string) {
        let newInt = newValue === '' ? 0 : parseInt(newValue);
        if (isNaN(newInt)) {
            return
        }
        switch (property) {
            case 'nebulaType':
                this.nebulaType = toRange(newInt, 0, 1)
                break;
            case 'radius':
                this.radius = toRange(newInt, 0);
                break;
            case 'minSeedRadius':
                this.minSeedRadius = toRange(newInt, 0);
                break;
            case 'maxSeedRadius':
                this.maxSeedRadius = toRange(newInt, 0);
                break;
            case 'nrOfSeeds':
                this.nrOfSeeds = toRange(newInt, 0);
                break;
            case 'fractalCount':
                this.fractalCount = toRange(newInt, 0);
                break;
            case 'subdivisionCount':
                this.subdivisionCount = toRange(newInt, 0);
                break;
        }
    }

    setFloatProperty(property: string, newValue: string) {
        let newFloat = newValue === '' ? 0 : parseFloat(newValue);
        if (isNaN(newFloat)) {
            return
        }
        switch (property) {
            case 'minRadiusPart':
                this.minRadiusPart = newFloat;
                break;
            case 'maxRadiusPart':
                this.maxRadiusPart = newFloat;
                break;
            case 'minAngleOffset':
                this.minAngleOffset = newFloat;
                break;
            case 'maxAngleOffset':
                this.maxAngleOffset = newFloat;
                break;
        }
    }

    generateNebulae(): Array<NebulaBubble> {
        let nebulae: Array<NebulaBubble> = [];
        switch (this.nebulaType) {
            case NebulaType.CIRCULAR:
                this.fixMinMax();
                for (let i = 0; i < this.nrOfSeeds; i++) {
                    nebulae = [
                        ...nebulae,
                        ...this.generateRandomNebulaeInCircle(this.radius, i)
                    ];
                }
                break;
            case NebulaType.PATH:
                this.fixMinMax();
                let minX = this.points[0].x;
                let minY = this.points[0].y;
                let maxX = this.points[0].x;
                let maxY = this.points[0].y;
                for (let i = 0; i < this.points.length; i++) {
                    minX = Math.min(this.points[i].x, minX);
                    minY = Math.min(this.points[i].y, minY);
                    maxX = Math.max(this.points[i].x, maxX);
                    maxY = Math.max(this.points[i].y, maxY);
                }
                for (let i = 0; i < this.nrOfSeeds; i++) {
                    nebulae = [
                        ...nebulae,
                        ...this.generateRandomNebulaeAlongPath(i, minX - this.radius, minY - this.radius, maxX - minX + 2 * this.radius, maxY - minY + 2 * this.radius, this.radius)
                    ];
                }
                break;
        }
        return nebulae;
    }

    private fixMinMax() {
        let minRadius = Math.min(this.minSeedRadius, this.maxSeedRadius)
        let maxRadius = Math.max(this.minSeedRadius, this.maxSeedRadius)
        this.minSeedRadius = minRadius;
        this.maxSeedRadius = maxRadius;
    }


    private generateRandomNebulaeInCircle(radius: number, count: number): Array<NebulaBubble> {
        let newPoint = generateRandomPointInCircle(this.points[0], radius)
        let seedRadius = this.minSeedRadius + (count / this.nrOfSeeds) * (this.maxSeedRadius - this.minSeedRadius)
        return this.subdivide(this.counter, newPoint, seedRadius)
    }

    private generateRandomNebulaeAlongPath(count: number, left: number, top: number, width: number, height: number, radius: number): Array<NebulaBubble> {
        let newPoint = generateRandomPointAlongPath(this.points, left, top, width, height, radius)
        let seedRadius = this.minSeedRadius + (count / this.nrOfSeeds) * (this.maxSeedRadius - this.minSeedRadius)
        return this.subdivide(this.counter, newPoint, seedRadius)
    }

    private subdivide(counter: number, center: Point, radius: number): Array<NebulaBubble> {
        let newNebulae: Array<NebulaBubble> = []
        let anglePerPart = (Math.PI * 2) / this.subdivisionCount + Math.random()
        let newRadius = this.minRadiusPart + (this.maxRadiusPart - this.minRadiusPart) * Math.random();
        let angle = this.minAngleOffset + (this.maxAngleOffset - this.minAngleOffset) * Math.random();
        for (let i = 0; i < this.subdivisionCount; i++) {
            angle = angle + anglePerPart
            let newX = Math.round(center.x + radius * Math.sin(angle));
            let newY = Math.round(center.y + radius * Math.cos(angle));
            if (counter === 0) {
                newNebulae.push(new NebulaBubble({x: newX, y: newY}, newRadius));
            } else {
                newNebulae = [
                    ...newNebulae,
                    ...this.subdivide(counter - 1, {x: newX, y: newY}, newRadius)
                ];
            }
        }
        return newNebulae;
    }

}

export {Nebula};