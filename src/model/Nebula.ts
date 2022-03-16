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

class Settings {

    fractalCount: number;
    nrOfSeeds: number;
    subdivisionCount: number;
    radius: number;
    minSeedRadius: number;
    maxSeedRadius: number;

    minRadiusPart: number;
    maxRadiusPart: number;

    minAngleOffset: number;
    maxAngleOffset: number;

    constructor(nebula: Nebula) {
        this.fractalCount = this.toInt(nebula.fractalCount, 3);
        nebula.fractalCount = "" + this.fractalCount;
        this.nrOfSeeds = this.toInt(nebula.nrOfSeeds, 15);
        nebula.nrOfSeeds = "" + this.nrOfSeeds;
        this.subdivisionCount = this.toInt(nebula.subdivisionCount, 5);
        nebula.subdivisionCount = "" + this.subdivisionCount;
        this.radius = this.toInt(nebula.radius, 50);
        nebula.radius = "" + this.radius;
        this.minSeedRadius = this.toInt(nebula.minSeedRadius, 50);
        nebula.minSeedRadius = "" + this.minSeedRadius;
        this.maxSeedRadius = this.toInt(nebula.maxSeedRadius, 125);
        nebula.maxSeedRadius = "" + this.maxSeedRadius;
        this.minRadiusPart = this.toFloat(nebula.minRadiusPart, 0.5);
        nebula.minRadiusPart = "" + this.minRadiusPart;
        this.maxRadiusPart = this.toFloat(nebula.maxRadiusPart, 0.7);
        nebula.maxRadiusPart = "" + this.maxRadiusPart;
        this.minAngleOffset = this.toFloat(nebula.minAngleOffset, -0.5);
        nebula.minAngleOffset = "" + this.minAngleOffset;
        this.maxAngleOffset = this.toFloat(nebula.maxAngleOffset, 0.5);
        nebula.maxAngleOffset = "" + this.maxAngleOffset;
    }

    toInt(val: string, defaultVal: number, requirePositive: boolean = true) {
        let result = parseInt(val);
        result = isNaN(result) ? defaultVal : result
        return result < 0 && requirePositive ? 0 : result;
    }

    toFloat(val: string, defaultVal: number) {
        let result = parseFloat(val);
        return isNaN(result) ? defaultVal : result;
    }

    fixMinMax() {
        let minRadius = Math.min(this.minSeedRadius, this.maxSeedRadius)
        let maxRadius = Math.max(this.minSeedRadius, this.maxSeedRadius)
        this.minSeedRadius = minRadius;
        this.maxSeedRadius = maxRadius;
    }
}

class Nebula extends ConfigurableItem {

    points: Array<Point>;

    nrOfSeeds = "15";

    radius = "50";

    minSeedRadius = "50";
    maxSeedRadius = "125";

    hue: number = 200.0;
    nebulaType: NebulaType;

    minRadiusPart: string = "0.5";
    maxRadiusPart: string = "0.7";

    minAngleOffset: string = "-0.5";
    maxAngleOffset: string = "0.5";

    fractalCount: string = "3";
    subdivisionCount: string = "5";

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

    setProperty(property: string, newValue: string) {
        switch (property) {
            case 'radius':
                this.radius = newValue
                this.needsGenerate = true;
                break;
            case 'minSeedRadius':
                this.minSeedRadius = newValue
                this.needsGenerate = true;
                break;
            case 'maxSeedRadius':
                this.maxSeedRadius = newValue
                this.needsGenerate = true;
                break;
            case 'nrOfSeeds':
                this.nrOfSeeds = newValue
                this.needsGenerate = true;
                break;
            case 'fractalCount':
                this.fractalCount = newValue
                this.needsGenerate = true;
                break;
            case 'subdivisionCount':
                this.subdivisionCount = newValue
                this.needsGenerate = true;
                break;
            case 'minRadiusPart':
                this.minRadiusPart = newValue;
                this.needsGenerate = true;
                break;
            case 'maxRadiusPart':
                this.maxRadiusPart = newValue;
                this.needsGenerate = true;
                break;
            case 'minAngleOffset':
                this.minAngleOffset = newValue;
                this.needsGenerate = true;
                break;
            case 'maxAngleOffset':
                this.maxAngleOffset = newValue;
                this.needsGenerate = true;
                break;
        }
    }

    setIntProperty(property: string, newValue: string | number) {
        let newInt: number;
        if (typeof newValue == 'string') {
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
            case 'hue':
                this.hue = newFloat;
                break;
        }
    }


    generateNebulae(): Array<NebulaBubble> {
        let settings = new Settings(this)

        let expectedCount = Math.ceil(settings.nrOfSeeds * Math.pow(settings.subdivisionCount, settings.fractalCount));
        let nebulae: Array<NebulaBubble> = new Array(expectedCount);
        let index = 0
        switch (this.nebulaType) {
            case NebulaType.CIRCULAR:
                settings.fixMinMax();
                for (let i = 0; i < settings.nrOfSeeds; i++) {
                    index = this.generateRandomNebulaeInCircle(settings, nebulae, index, settings.radius, i)
                }
                break;
            case NebulaType.PATH:
                settings.fixMinMax();
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
                for (let i = 0; i < settings.nrOfSeeds; i++) {
                    index = this.generateRandomNebulaeAlongPath(settings, nebulae, index, i,
                        minX - settings.radius, minY - settings.radius,
                        maxX - minX + 2 * settings.radius,
                        maxY - minY + 2 * settings.radius, settings.radius)
                }
                break;
        }
        this.needsGenerate = false;
        return nebulae.slice(0, index);
    }


    private generateRandomNebulaeInCircle(settings: Settings, nebulae: Array<NebulaBubble>, index: number, radius: number, count: number): number {
        let newPoint = generateRandomPointInCircle(this.points[0], radius)
        let seedRadius = settings.minSeedRadius + (count / settings.nrOfSeeds) * (settings.maxSeedRadius - settings.minSeedRadius)
        return this.subdivide(settings, nebulae, index, settings.fractalCount > 0 ? settings.fractalCount - 1 : 0, newPoint, seedRadius, 0)
    }

    private generateRandomNebulaeAlongPath(settings: Settings, nebulae: Array<NebulaBubble>, index: number, count: number, left: number, top: number, width: number, height: number, radius: number): number {
        let newPoint;
        if (this.points.length < 2) {
            newPoint = generateRandomPointInCircle(this.points[0], radius)
        } else {
            newPoint = generateRandomPointAlongPath(this.points, left, top, width, height, radius)
        }
        let seedRadius = settings.minSeedRadius + (count / settings.nrOfSeeds) * (settings.maxSeedRadius - settings.minSeedRadius)
        return this.subdivide(settings, nebulae, index, settings.fractalCount > 0 ? settings.fractalCount - 1 : 0, newPoint, seedRadius, 0)
    }

    private subdivide(settings: Settings, nebulae: Array<NebulaBubble>, index: number, counter: number, center: Point, radius: number, randomCount: number): number {
        let anglePerPart = (Math.PI * 2) / settings.subdivisionCount
        let newRadius = radius * (settings.minRadiusPart + (settings.maxRadiusPart - settings.minRadiusPart) * Math.random());
        let angle = settings.minAngleOffset + (settings.maxAngleOffset - settings.minAngleOffset) * Math.random();
        for (let i = 0; i < settings.subdivisionCount; i++) {
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
                index = this.subdivide(settings, nebulae, index, counter - 1, {x: newX, y: newY}, newRadius, 0)
            }
        }
        return index;
    }

}

export {Nebula, NebulaBubble, NebulaType};