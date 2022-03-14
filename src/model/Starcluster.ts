import {ConfigurableItem, ItemType} from "./ConfigurableItem";
import {Point} from "./Point";
import {RGBColor} from "react-color";
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
    maxRadius: number = 50;
    minRadius: number = 100;
    maxBrightness: number = 255;
    blooming: number = 100; // 1- 255

    clusterType: StarClusterType = StarClusterType.CIRCULAR;

    nrOfStars: number = 200;

    constructor(id: number, points: Array<Point>) {
        super(id)
        this.points = points;
    }

    copy(): Starcluster {
        let copy = new Starcluster(this.id, this.points);
        copy.minRadius = this.minRadius;
        copy.maxRadius = this.maxRadius;
        copy.clusterType = this.clusterType;
        copy.maxBrightness = this.maxBrightness;
        copy.blooming = this.blooming;
        copy.nrOfStars = this.nrOfStars;
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

    getColor(): RGBColor {
        return {r: 255, g: 255, b: 255}
    }

    setProperty(property: string, newValue: string) {
        let newInt = newValue === '' ? 0 : parseInt(newValue);
        if (isNaN(newInt)) {
            return
        }
        switch (property) {
            case 'clusterType':
                this.clusterType = toRange(newInt, 0, 2)
                if (this.clusterType === StarClusterType.RECTANGULAR && this.points.length < 2) {
                    this.addPoint()
                }
                break;
            case 'minRadius':
                this.minRadius = toRange(newInt, 0);
                break;
            case 'maxRadius':
                this.maxRadius = toRange(newInt, 0);
                break;
            case 'nrOfStars':
                this.nrOfStars = toRange(newInt, 0);
                break;
            case 'maxBrightness':
                this.maxBrightness = toRange(newInt, 1, 1000);
                break;
            case 'blooming':
                this.blooming = toRange(newInt, 0, 255);
                break;
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

    generateStars(): Array<Star> {
        let stars: Array<Star> = [];
        switch (this.clusterType) {
            case StarClusterType.CIRCULAR:
                this.fixMinMax();
                for (let i = 0; i < this.nrOfStars; i++) {
                    // Increase the allowed radius linearly, which will make more stars appear in the center
                    let radius = this.minRadius + (i / this.nrOfStars) * (this.maxRadius - this.minRadius)
                    stars.push(this.generateRandomStarInCircle(radius))
                }
                break;
            case StarClusterType.RECTANGULAR:
                let xLeft = Math.min(this.points[0].x, this.points[1].x);
                let yTop = Math.min(this.points[0].y, this.points[1].y)
                let width = Math.abs(this.points[1].x - this.points[0].x);
                let height = Math.abs(this.points[1].y - this.points[0].y);
                for (let i = 0; i < this.nrOfStars; i++) {
                    stars.push(Starcluster.generateRandomStarInSquare(xLeft, yTop, width, height))
                }
                break;
            case StarClusterType.PATH:
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
                for (let i = 0; i < this.nrOfStars; i++) {
                    // Increase the allowed radius linearly, which will make more stars appear in the center
                    let radius = this.minRadius + (i / this.nrOfStars) * (this.maxRadius - this.minRadius)
                    stars.push(this.generateRandomStarAlongPath(minX - radius, minY - radius, maxX - minX + 2 * radius, maxY - minY + 2 * radius, radius))
                }
                break;
        }
        return stars;
    }

    private fixMinMax() {
        let minRadius = Math.min(this.minRadius, this.maxRadius)
        let maxRadius = Math.max(this.minRadius, this.maxRadius)
        this.minRadius = minRadius;
        this.maxRadius = maxRadius;
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
        let newPoint = generateRandomPointAlongPath(this.points, left, top, width, height, radius)
        return new Star(newPoint, brightness)
    }

}

export {Star, Starcluster, StarClusterType};