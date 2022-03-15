import {HSLColor} from "react-color";
import {Point} from "./Point";
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

    nrOfSeeds = 5;

    radius = 100;

    minSeedRadius = 100;
    maxSeedRadius = 150;

    hue: number = 200.0;
    nebulaType: NebulaType;

    minRadiusPart: number = 0.5;
    maxRadiusPart: number = 0.6;

    minAngleOffset: number = -0.5;
    maxAngleOffset: number = 0.5;

    fractalCount: number = 6;
    subdivisionCount: number = 5;

    innerFade: number = 20;
    outerFade: number = 90;

    smooth: number = 10;

    brightness: number = 20;

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

    getColor(): HSLColor {
        return {
            h: this.hue,
            l: 50.0,
            s: 100.0,
        }
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

    setIntProperty(property: string, newValue: string|number) {
        let newInt: number;
        if(typeof newValue == 'string') {
            newInt = newValue === '' ? 0 : parseInt(newValue as string);
            if (isNaN(newInt)) {
                return
            }
        } else {
            newInt = newValue as number
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
            case 'innerFade':
                this.innerFade = newInt;
                if(this.outerFade < this.innerFade) {
                    this.outerFade = this.innerFade;
                }
                break;
            case 'outerFade':
                this.outerFade = newInt;
                if(this.outerFade < this.innerFade) {
                    this.innerFade = this.outerFade;
                }
                break;
            case 'smooth':
                this.smooth = newInt;
                break;
            case 'brightness':
                this.brightness = newInt;
                break;
        }
    }

    setFloatProperty(property: string, newValue: string|number) {
        let newFloat: number;
        if(typeof newValue == 'string') {
            newFloat = newValue === '' ? 0 : parseFloat(newValue as string);
            if (isNaN(newFloat)) {
                return
            }
        } else {
            newFloat = newValue as number
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
            case 'hue':
                this.hue = newFloat;
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
        return this.subdivide(this.fractalCount>0 ? this.fractalCount-1 : 0, newPoint, seedRadius,0)
    }

    private generateRandomNebulaeAlongPath(count: number, left: number, top: number, width: number, height: number, radius: number): Array<NebulaBubble> {
        let newPoint = generateRandomPointAlongPath(this.points, left, top, width, height, radius)
        let seedRadius = this.minSeedRadius + (count / this.nrOfSeeds) * (this.maxSeedRadius - this.minSeedRadius)
        return this.subdivide(this.fractalCount>0 ? this.fractalCount-1 : 0, newPoint, seedRadius,0)
    }

    private subdivide(counter: number, center: Point, radius: number, randomCount: number): Array<NebulaBubble> {
        let newNebulae: Array<NebulaBubble> = []
        let anglePerPart = (Math.PI * 2) / this.subdivisionCount
        let newRadius = radius * (this.minRadiusPart + (this.maxRadiusPart - this.minRadiusPart) * Math.random());
        let angle = this.minAngleOffset + (this.maxAngleOffset - this.minAngleOffset) * Math.random();
        for (let i = 0; i < this.subdivisionCount; i++) {
            angle = angle + anglePerPart
            let newX = Math.round(center.x + newRadius * Math.sin(angle));
            let newY = Math.round(center.y + newRadius * Math.cos(angle));
            if (counter <= 0) {
                newNebulae.push(new NebulaBubble({x: newX, y: newY}, newRadius));
            } else {
                if(Math.random() < 0.9 || randomCount > 3) {
                    newNebulae = [
                        ...newNebulae,
                        ...this.subdivide(counter - 1, {x: newX, y: newY}, newRadius,0)
                    ];
                } else {
                    newNebulae = [
                        ...newNebulae,
                        ...this.subdivide(counter, {x: newX, y: newY}, radius,randomCount + 1)
                    ];
                }
            }
        }
        return newNebulae;
    }

}

export {Nebula, NebulaBubble, NebulaType};