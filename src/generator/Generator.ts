import {Star, Starcluster} from "../model/Starcluster";
import {Point} from "../model/Point";
import {distanceToPoint} from "../util/mathHelper";

class StarRenderData {

    width: number;
    height: number;
    values: Array<number>

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.values = [];
    }

    clear() {
        this.values = new Array(this.width * this.height);
    }

    addValue(point: Point, value: number) {
        let index = point.y * this.width + point.x;
        if (this.values[index] && !isNaN(this.values[index])) {
            this.values[index] += value;
        } else {
            this.values[index] = value;
        }
    }

    isEmpty() {
        for (let i = 0; i < this.values.length; i++) {
            if (this.values[i] && !isNaN(this.values[i]))
                return false
        }
        return true
    }

    getValue(idx: number): number {
        let result = idx >= 0 && idx < this.values.length ? this.values[idx] : 0;
        if (isNaN(result)) {
            return 0.0;
        } else {
            return result;
        }
    }
}

class Generator {

    width: number;
    height: number;

    starClusterRenders: Array<StarRenderData>

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.starClusterRenders = []
    }

    isValidPoint(point: Point) {
        return point.x >= 0 && point.x < this.width && point.y >= 0 && point.y < this.height;
    }

    drawStar(renderData: StarRenderData, star: Star, maxBrightness: number, blooming: number) {
        let falloff = 3.6 - (blooming / 100.0)
        let brightness = star.brightness * maxBrightness;
        let adjustedBrightness = brightness / 2.0;
        let radius = 0
        while (adjustedBrightness > 5.0 && radius < this.width) {
            radius++;
            adjustedBrightness = adjustedBrightness / falloff;
        }
        let center = star.center
        let leftTop = {x: center.x - radius, y: center.y - radius}
        for (let x = leftTop.x; x < leftTop.x + radius * 2; x++) {
            for (let y = leftTop.y; y < leftTop.y + radius * 2; y++) {
                let pt = {x: x, y: y}
                let dist = distanceToPoint(center, pt);
                let b = dist === 0 ? brightness : brightness / Math.pow(falloff, dist)
                if (this.isValidPoint(pt)) {
                    renderData.addValue(pt, b)
                }
            }
        }
    }

    renderStars(index: number, cluster: Starcluster) {
        while (this.starClusterRenders.length <= index) {
            this.starClusterRenders.push(new StarRenderData(this.width, this.height));
        }
        this.starClusterRenders[index].clear();
        let stars = cluster.generateStars();
        stars.forEach((star) => {
            this.drawStar(this.starClusterRenders[index], star, cluster.maxBrightness, cluster.blooming)
        });
    }

    paint(context: CanvasRenderingContext2D | null) {
        if (context === null) {
            return;
        }
        let imageData = context.createImageData(this.width, this.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
            let brightness = 0.0;
            for (let j = 0; j < this.starClusterRenders.length; j++) {
                brightness += this.starClusterRenders[j].getValue(i / 4);
            }
            imageData.data[i] = brightness <= 255 ? brightness : 255;
            imageData.data[i + 1] = brightness <= 255 ? brightness : 255;
            imageData.data[i + 2] = brightness <= 255 ? brightness : 255;
            imageData.data[i + 3] = 255;
        }
        context.putImageData(imageData, 0, 0);
    }
}

export {Generator}