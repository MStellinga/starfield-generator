import {ConfigurableItem, ItemType} from "./ConfigurableItem";
import {Point} from "./Point";
import {
    generateRandomPointAlongPath,
    generateRandomPointInCircle,
    generateRandomPointInRect,
    toRange
} from "../util/mathHelper";

class Star {
    center: Point

    brightness: number;

    constructor(center: Point, brightness: number) {
        this.center = center;

        this.brightness = brightness;
    }
}

enum StarClusterType {
    // Stars between minRadius and maxRadius around central point[0]
    CIRCULAR,
    // Stars in rectangle between point[0] and point[1]
    RECTANGULAR,
    // Stars between minRadius and maxRadius from the lines created by the points
    PATH
}

class Starcluster extends ConfigurableItem {

    points: Array<Point>;
    minRadius: string = "50";
    maxRadius: string = "100";
    nrOfStars: string = "200";
    brightness: number = 100;
    blooming: number = 25; // 0 - 100

    clusterType: StarClusterType = StarClusterType.CIRCULAR;

    constructor(id: number, points: Array<Point>) {
        super(id)
        this.points = points;
    }

    copy(): Starcluster {
        let copy = new Starcluster(this.id, this.points);
        copy.minRadius = this.minRadius;
        copy.maxRadius = this.maxRadius;
        copy.clusterType = this.clusterType;
        copy.brightness = this.brightness;
        copy.blooming = this.blooming;
        copy.nrOfStars = this.nrOfStars;
        copy.needsGenerate = this.needsGenerate;
        return copy;
    }

    setPoint(index: number, point: Point) {
        if (index >= 0 && index < this.points.length) {
            this.points[index] = point;
        }
    }

    getType() {
        return ItemType.STARCLUSTER
    }

    getPointsToRender(): Array<Point> {
        switch (this.clusterType) {
            case StarClusterType.CIRCULAR:
                return [this.points[0]];
            case StarClusterType.RECTANGULAR:
                return [this.points[0], this.points[1]];
            case StarClusterType.PATH:
                return this.points
        }
    }

    canAddPoints(): boolean {
        switch (this.clusterType) {
            case StarClusterType.CIRCULAR:
                return this.points.length === 0;
            case StarClusterType.RECTANGULAR:
                return this.points.length < 2;
            case StarClusterType.PATH:
                return true;
        }
    }

    canRemovePoints(): boolean {
        switch (this.clusterType) {
            case StarClusterType.CIRCULAR:
                return false;
            case StarClusterType.RECTANGULAR:
                return false
            case StarClusterType.PATH:
                return this.points.length > 1;
        }
    }

    setProperty(property: string, newValue: string) {
        switch (property) {
            case 'minRadius':
                this.minRadius = newValue;
                this.needsGenerate = true;
                break;
            case 'maxRadius':
                this.maxRadius = newValue;
                this.needsGenerate = true;
                break;
            case 'nrOfStars':
                this.nrOfStars = newValue;
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
            case 'clusterType':
                this.clusterType = toRange(newInt, 0, 2)
                if (this.clusterType === StarClusterType.RECTANGULAR && this.points.length < 2) {
                    this.addPoint()
                }
                this.needsGenerate = true;
                break;
            case 'brightness':
                this.brightness = newInt;
                this.needsRender = true;
                break;
            case 'blooming':
                this.blooming = toRange(newInt, 0, 255);
                this.needsRender = true;
                break;
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

    toInt(val: string, defaultVal: number, requirePositive: boolean = true) {
        let result = parseInt(val);
        result = isNaN(result) ? defaultVal : result
        return result < 0 && requirePositive ? 0 : result;
    }

    generateStars(): Array<Star> {
        let nrOfStars = this.toInt(this.nrOfStars, 200);
        let minRadius = this.toInt(this.minRadius, 50);
        let maxRadius = this.toInt(this.maxRadius, 100);
        if (maxRadius < minRadius) {
            let tmp = maxRadius;
            maxRadius = minRadius;
            minRadius = tmp;
        }
        this.nrOfStars = "" + nrOfStars;
        this.minRadius = "" + minRadius;
        this.maxRadius = "" + maxRadius;

        let stars: Array<Star> = [];
        switch (this.clusterType) {
            case StarClusterType.CIRCULAR:
                for (let i = 0; i < nrOfStars; i++) {
                    // Increase the allowed radius linearly, which will make more stars appear in the center
                    let radius = minRadius + (i / nrOfStars) * (maxRadius - minRadius)
                    stars.push(this.generateRandomStarInCircle(radius))
                }
                break;
            case StarClusterType.RECTANGULAR:
                let xLeft = Math.min(this.points[0].x, this.points[1].x);
                let yTop = Math.min(this.points[0].y, this.points[1].y)
                let width = Math.abs(this.points[1].x - this.points[0].x);
                let height = Math.abs(this.points[1].y - this.points[0].y);
                for (let i = 0; i < nrOfStars; i++) {
                    stars.push(Starcluster.generateRandomStarInSquare(xLeft, yTop, width, height))
                }
                break;
            case StarClusterType.PATH:
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
                for (let i = 0; i < nrOfStars; i++) {
                    // Increase the allowed radius linearly, which will make more stars appear in the center
                    let radius = minRadius + (i / nrOfStars) * (maxRadius - minRadius)
                    stars.push(this.generateRandomStarAlongPath(minX - radius, minY - radius, maxX - minX + 2 * radius, maxY - minY + 2 * radius, radius))
                }
                break;
        }
        this.needsGenerate = false;
        return stars;
    }

    private generateRandomStarInCircle(radius: number) {
        let newPoint = generateRandomPointInCircle(this.points[0], radius)
        let brightness = Math.random()
        return new Star(newPoint, brightness)
    }

    private static generateRandomStarInSquare(xLeft: number, yTop: number, width: number, height: number) {
        let newPoint = generateRandomPointInRect(xLeft, yTop, width, height)
        let brightness = Math.random()
        return new Star(newPoint, brightness)
    }

    private generateRandomStarAlongPath(left: number, top: number, width: number, height: number, radius: number) {
        let brightness = Math.random()
        let newPoint;
        if (this.points.length < 2) {
            newPoint = generateRandomPointInCircle(this.points[0], radius)
        } else {
            newPoint = generateRandomPointAlongPath(this.points, left, top, width, height, radius)
        }
        return new Star(newPoint, brightness)
    }

}

export {Star, Starcluster, StarClusterType};