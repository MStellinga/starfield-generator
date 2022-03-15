import {HSLColor} from "react-color";
import {Point} from "./Point";
import {ConfigurableItem, ItemType} from "./ConfigurableItem";
import {generateRandomPointAlongPath, generateRandomPointInCircle, toRange} from "../util/mathHelper";

const BREAKOUT_CHANCE = 0.9

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

    nrOfSeeds = 15;

    radius = 50;

    minSeedRadius = 50;
    maxSeedRadius = 125;

    hue: number = 200.0;
    nebulaType: NebulaType;

    minRadiusPart: number = 0.5;
    maxRadiusPart: number = 0.7;

    minAngleOffset: number = -0.5;
    maxAngleOffset: number = 0.5;

    fractalCount: number = 3;
    subdivisionCount: number = 5;

    innerFade: number = 0;
    outerFade: number = 50;

    smooth: number = 50;

    brightness: number = 10;

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
        copy.innerFade = this.innerFade;
        copy.outerFade = this.outerFade;
        copy.smooth = this.smooth;
        copy.brightness = this.brightness;
        copy.needsGenerate = this.needsGenerate;
        return copy;
    }

    setPoint(index: number, point: Point) {
        if (index >= 0 && index < this.points.length) {
            this.points[index] = point;
            this.needsGenerate = true;
        }
    }


    addPoint() {
        let newPoint = {x: this.points[this.points.length - 1].x + 20, y: this.points[this.points.length - 1].y + 20}
        this.points.push(newPoint);
        this.counter++;
        this.needsGenerate = true;
    }

    removePoint(index: number) {
        this.points.splice(index, 1)
        this.counter++;
        this.needsGenerate = true;
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
                this.needsGenerate = true;
                break;
            case 'radius':
                this.radius = toRange(newInt, 0);
                this.needsGenerate = true;
                break;
            case 'minSeedRadius':
                this.minSeedRadius = toRange(newInt, 0);
                this.needsGenerate = true;
                break;
            case 'maxSeedRadius':
                this.maxSeedRadius = toRange(newInt, 0);
                this.needsGenerate = true;
                break;
            case 'nrOfSeeds':
                this.nrOfSeeds = toRange(newInt, 0);
                this.needsGenerate = true;
                break;
            case 'fractalCount':
                this.fractalCount = toRange(newInt, 0);
                this.needsGenerate = true;
                break;
            case 'subdivisionCount':
                this.subdivisionCount = toRange(newInt, 0);
                this.needsGenerate = true;
                break;
            case 'innerFade':
                this.innerFade = newInt;
                if(this.outerFade < this.innerFade) {
                    this.outerFade = this.innerFade;
                }
                this.needsRender = true;
                break;
            case 'outerFade':
                this.outerFade = newInt;
                if(this.outerFade < this.innerFade) {
                    this.innerFade = this.outerFade;
                }
                this.needsRender = true;
                break;
            case 'smooth':
                this.smooth = newInt;
                this.needsRender = true;
                break;
            case 'brightness':
                this.brightness = newInt;
                this.needsRender = true;
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
                this.needsGenerate = true;
                break;
            case 'maxRadiusPart':
                this.maxRadiusPart = newFloat;
                this.needsGenerate = true;
                break;
            case 'minAngleOffset':
                this.minAngleOffset = newFloat;
                this.needsGenerate = true;
                break;
            case 'maxAngleOffset':
                this.maxAngleOffset = newFloat;
                this.needsGenerate = true;
                break;
            case 'hue':
                this.hue = newFloat;
                break;
        }
    }

    generateNebulae(): Array<NebulaBubble> {
        let expectedCount = Math.ceil(this.nrOfSeeds * Math.pow(this.subdivisionCount, this.fractalCount));
        let nebulae: Array<NebulaBubble> = new Array(expectedCount);
        let index = 0
        switch (this.nebulaType) {
            case NebulaType.CIRCULAR:
                this.fixMinMax();
                for (let i = 0; i < this.nrOfSeeds; i++) {
                    index = this.generateRandomNebulaeInCircle(nebulae, index, this.radius, i)
                }
                break;
            case NebulaType.PATH:
                this.fixMinMax();
                let minX = Math.min(...this.points.map((pt) => {
                    return pt.x
                }));
                let minY = Math.min(...this.points.map((pt) => {
                    return pt.y
                }));
                let maxX = Math.max(...this.points.map((pt) => {
                    return pt.x
                }));
                let maxY = Math.max(...this.points.map((pt) => {
                    return pt.y
                }));
                for (let i = 0; i < this.nrOfSeeds; i++) {
                    index = this.generateRandomNebulaeAlongPath(nebulae, index, i,
                        minX - this.radius, minY - this.radius,
                        maxX - minX + 2 * this.radius,
                        maxY - minY + 2 * this.radius, this.radius)
                }
                break;
        }
        this.needsGenerate = false;
        return nebulae.slice(0, index);
    }

    private fixMinMax() {
        let minRadius = Math.min(this.minSeedRadius, this.maxSeedRadius)
        let maxRadius = Math.max(this.minSeedRadius, this.maxSeedRadius)
        this.minSeedRadius = minRadius;
        this.maxSeedRadius = maxRadius;
    }


    private generateRandomNebulaeInCircle(nebulae: Array<NebulaBubble>, index: number, radius: number, count: number): number {
        let newPoint = generateRandomPointInCircle(this.points[0], radius)
        let seedRadius = this.minSeedRadius + (count / this.nrOfSeeds) * (this.maxSeedRadius - this.minSeedRadius)
        return this.subdivide(nebulae, index, this.fractalCount > 0 ? this.fractalCount - 1 : 0, newPoint, seedRadius, 0)
    }

    private generateRandomNebulaeAlongPath(nebulae: Array<NebulaBubble>, index: number, count: number, left: number, top: number, width: number, height: number, radius: number): number {
        let newPoint = generateRandomPointAlongPath(this.points, left, top, width, height, radius)
        let seedRadius = this.minSeedRadius + (count / this.nrOfSeeds) * (this.maxSeedRadius - this.minSeedRadius)
        return this.subdivide(nebulae, index, this.fractalCount > 0 ? this.fractalCount - 1 : 0, newPoint, seedRadius, 0)
    }

    private subdivide(nebulae: Array<NebulaBubble>, index: number, counter: number, center: Point, radius: number, randomCount: number): number {
        let anglePerPart = (Math.PI * 2) / this.subdivisionCount
        let newRadius = radius * (this.minRadiusPart + (this.maxRadiusPart - this.minRadiusPart) * Math.random());
        let angle = this.minAngleOffset + (this.maxAngleOffset - this.minAngleOffset) * Math.random();
        for (let i = 0; i < this.subdivisionCount; i++) {
            angle = angle + anglePerPart
            let radius2 = Math.random() < BREAKOUT_CHANCE ? newRadius : newRadius * 2;
            let newX = Math.round(center.x + radius2 * Math.sin(angle));
            let newY = Math.round(center.y + radius2 * Math.cos(angle));
            if (counter <= 0) {
                let bubble = new NebulaBubble({x: newX, y: newY}, radius2);
                if (nebulae.length >= index) {
                    // should not happen
                    nebulae.push(bubble)
                }
                nebulae[index] = bubble;
                index++;
            } else {
                index = this.subdivide(nebulae, index, counter - 1, {x: newX, y: newY}, newRadius, 0)
            }
        }
        return index;
    }

}

export {Nebula, NebulaBubble, NebulaType};