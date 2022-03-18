import {HSLColor} from "react-color";
import {Point} from "./Point";
import {ConfigurableItem, ItemType} from "./ConfigurableItem";
import {
    distanceToLine,
    distanceToPoint,
    generateRandomPointAlongPath,
    generateRandomPointInCircle,
    toRange
} from "../util/mathHelper";

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

    hue1: number = 200.0;
    hue2: number = 200.0;
    nebulaType: NebulaType;

    minRadiusPart: string = "0.5";
    maxRadiusPart: string = "0.7";

    minAngleOffset: string = "-0.5";
    maxAngleOffset: string = "0.5";

    fractalCount: string = "3";
    subdivisionCount: string = "5";

    innerFade: number = 0;
    outerFade: number = 50;

    hue1Fraction: number = 55;
    hue2Fraction: number = 100;

    hollowEmpty: number = 0;
    hollowFull: number = 0;

    smooth: number = 50;

    brightness: number = 20;

    cutOutSize: number = 0;
    cutOutAngle: number = 0;
    cutOutFade: number = 0;

    generatedMinX = -1;
    generatedMaxX = -1;
    generatedMinY = -1;
    generatedMaxY = -1;
    generatedRadius = 0;

    cutOutRad: number = 0.0;
    fadeRad: number = 0.0;
    angleRad: number = 0.0;

    constructor(id: number, points: Array<Point>) {
        super(id)
        this.points = points;
        this.nebulaType = NebulaType.CIRCULAR;
        this.itemType = 1;
    }

    copy(): Nebula {
        return Nebula.copyFromAny(this);
    }

    static copyFromAny(other: any) {
        let copy = new Nebula(other.id, other.points);
        copy.nrOfSeeds = other.nrOfSeeds;
        copy.radius = other.radius;
        copy.minSeedRadius = other.minSeedRadius;
        copy.maxSeedRadius = other.maxSeedRadius;
        copy.hue1 = other.hue1;
        copy.hue2 = other.hue2;
        copy.hue1Fraction = other.hue1Fraction;
        copy.hue2Fraction = other.hue2Fraction;
        copy.nebulaType = other.nebulaType;
        copy.minRadiusPart = other.minRadiusPart;
        copy.maxRadiusPart = other.maxRadiusPart;
        copy.minAngleOffset = other.minAngleOffset;
        copy.maxAngleOffset = other.maxAngleOffset;
        copy.fractalCount = other.fractalCount;
        copy.subdivisionCount = other.subdivisionCount;
        copy.innerFade = other.innerFade;
        copy.outerFade = other.outerFade;
        copy.smooth = other.smooth;
        copy.brightness = other.brightness;
        copy.needsGenerate = other.needsGenerate;
        copy.hollowEmpty = other.hollowEmpty;
        copy.hollowFull = other.hollowFull;
        copy.cutOutSize = other.cutOutSize;
        copy.cutOutFade = other.cutOutFade;
        copy.cutOutAngle = other.cutOutAngle;
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

    getHue1(): HSLColor {
        return {
            h: this.hue1,
            l: 50.0,
            s: 100.0,
        }
    }

    getHue2(): HSLColor {
        return {
            h: this.hue2,
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
                break;
            case 'outerFade':
                this.outerFade = newInt;
                if (this.outerFade < this.innerFade) {
                    this.innerFade = this.outerFade;
                }
                break;
            case 'smooth':
                this.smooth = newInt;
                break;
            case 'brightness':
                this.brightness = newInt;
                break;
            case 'hue1Fraction':
                this.hue1Fraction = newInt;
                break;
            case 'hue2Fraction':
                this.hue2Fraction = newInt;
                break;
            case 'hollowEmpty':
                this.hollowEmpty = newInt;
                break;
            case 'hollowFull':
                this.hollowFull = newInt;
                break;
            case 'cutOutSize':
                this.cutOutSize = newInt;
                break;
            case 'cutOutFade':
                this.cutOutFade = newInt;
                break;
            case 'cutOutAngle':
                this.cutOutAngle = newInt;
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
            case 'hue1':
                this.hue1 = newFloat;
                break;
            case 'hue2':
                this.hue2 = newFloat;
                break;
        }
    }

    getDistanceToPoints(pt: Point) {
        switch (this.nebulaType) {
            case NebulaType.CIRCULAR:
                return distanceToPoint(pt, this.points[0]);
            case NebulaType.PATH:
                let minDistance = distanceToPoint(pt, this.points[0]);
                if (this.points.length < 2) {
                    return minDistance;
                }
                for (let i = 1; i < this.points.length; i++) {
                    minDistance = Math.min(minDistance, distanceToLine(pt, this.points[i - 1], this.points[i]));
                }
                return minDistance;
        }
        return 0;
    }

    getAngleToCenter(pt: Point) {
        let x = pt.x - this.points[0].x;
        let y = pt.y - this.points[0].y;
        return Math.atan2(y, x);
    }

    calcHue(distance: number, hue1Radius: number, hue2Radius: number) {
        let result;
        if (Math.abs(this.hue1 - this.hue2) < 5) {
            result = this.hue1;
        } else if (distance < hue1Radius) {
            result = this.hue1;
        } else if (distance > hue2Radius) {
            result = this.hue2;
        } else if (this.hue2 - this.hue1 < 180) {
            let range = hue2Radius - hue1Radius;
            result = this.hue2 * (distance - hue1Radius) / range + this.hue1 * (hue1Radius + range - distance) / range
        } else {
            // Gradient the other way
            let h1 = this.hue1 > 180 ? this.hue1 - 180 : this.hue1 + 180;
            let h2 = this.hue2 > 180 ? this.hue2 - 180 : this.hue2 + 180;
            let range = hue2Radius - hue1Radius;
            let res = h1 * (distance - hue1Radius) / range + h2 * (hue1Radius + range - distance) / range
            result = res < 180 ? res + 180 : res - 180;
        }
        return result;
    }

    getAngleValue(pt: Point) {
        if (this.cutOutRad < 0.1) {
            return 1.0;
        }
        let angle = this.getAngleToCenter(pt) - this.angleRad;
        while (angle < 0.0) {
            angle = angle + Math.PI * 2;
        }
        let val = 0.0;
        let l2 = this.fadeRad;
        let r1 = this.cutOutRad - this.fadeRad;
        let r2 = this.cutOutRad;

        if (angle >= l2 && angle < r1) {
            return 0.0;
        }
        if (angle >= r2) {
            return 1.0;
        }
        if (angle < l2) {
            val += (l2 - angle) / l2;
        }
        if (angle >= r1) {
            val += 1 - (r2 - angle) / (r2 - r1);
        }
        return val;
    }

    generateNebulae(): Array<NebulaBubble> {
        let settings = new Settings(this)
        if (this.nebulaType == NebulaType.CIRCULAR) {
            this.cutOutFade = Math.min(this.cutOutFade, this.cutOutSize / 2);
            this.cutOutRad = this.cutOutSize * Math.PI / 50.0;
            this.fadeRad = this.cutOutFade * Math.PI / 50.0;
            this.angleRad = this.cutOutAngle * Math.PI / 50.0;
        } else {
            this.cutOutRad = 0.0;
        }

        this.generatedMinX = this.points[0].x;
        this.generatedMaxX = this.points[0].x;
        this.generatedMinY = this.points[0].y;
        this.generatedMaxY = this.points[0].y;

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
        this.calcGeneratedRadius();
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
                this.generatedMinX = Math.min(this.generatedMinX, newX - radius2);
                this.generatedMaxX = Math.min(this.generatedMaxX, newX + radius2);
                this.generatedMinY = Math.min(this.generatedMinY, newY - radius2);
                this.generatedMaxY = Math.min(this.generatedMaxY, newY + radius2);
                index++;
            } else {
                index = this.subdivide(settings, nebulae, index, counter - 1, {x: newX, y: newY}, newRadius, 0)
            }
        }
        return index;
    }

    private calcGeneratedRadius() {
        let rad1 = distanceToPoint({x: this.generatedMinX, y: this.generatedMinY}, this.points[0])
        let rad2 = distanceToPoint({x: this.generatedMinX, y: this.generatedMinY}, this.points[0])
        this.generatedRadius = (Math.max(rad1, rad2) + parseInt(this.radius)) / 2.0
    }

}

export {Nebula, NebulaBubble, NebulaType};