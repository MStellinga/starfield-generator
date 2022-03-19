import {Star, Starcluster} from "../model/Starcluster";
import {distanceToPoint} from "../util/mathHelper";
import {Nebula, NebulaBubble} from "../model/Nebula";
import {ConfigurableItem, ItemType} from "../model/ConfigurableItem";

class RenderData {
    width: number = 0;
    height: number = 0;
    gasBlooming: number = 0;
    layers: Array<RenderLayer> = [];

    constructor(width: number, height: number, gasBlooming: number, layers: Array<RenderLayer>) {
        this.width = width;
        this.height = height;
        this.gasBlooming = gasBlooming;
        this.layers = layers;
    }

    static copyFromAny(other: any) {
        let newLayers: Array<RenderLayer> = [];
        for (let i = 0; i < other.layers.length; i++) {
            newLayers.push(RenderLayer.copyFromAny(other.layers[i]))
        }
        return new RenderData(other.width, other.height, other.gasBlooming, newLayers);
    }
}

enum LayerType {
    SATURATION,
    LIGHT
}

class RenderLayer {

    width: number;
    height: number;
    active: boolean = true;
    values: Array<number> = [];
    extraValues: Array<number> = [];
    layerType: LayerType = LayerType.LIGHT

    nebula: Nebula | null = null;
    bubbles: Array<NebulaBubble> = [];

    cluster: Starcluster | null = null;
    stars: Array<Star> = [];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    static copyFromAny(other: any) {
        let result = new RenderLayer(other.width, other.height);
        result.active = other.active;
        result.values = other.values;
        result.extraValues = other.extraValues;
        result.layerType = other.layerType == 1 ? LayerType.LIGHT : LayerType.SATURATION;
        return result;
    }

    clear() {
        this.values = new Array(this.width * this.height);
        this.extraValues = new Array(this.width * this.height);
    }

    addValue(x: number, y: number, value: number) {
        let index = y * this.width + x;
        if (this.values[index] && !isNaN(this.values[index])) {
            this.values[index] += value;
        } else {
            this.values[index] = value;
        }
    }

    setValue(x: number, y: number, value: number) {
        this.values[y * this.width + x] = value;
    }

    addExtraValue(x: number, y: number, value: number) {
        let index = y * this.width + x;
        if (this.extraValues[index] && !isNaN(this.extraValues[index])) {
            this.extraValues[index] += value;
        } else {
            this.extraValues[index] = value;
        }
    }

    setExtraValue(x: number, y: number, value: number) {
        this.extraValues[y * this.width + x] = value;
    }

    addExtraValueWithBrightness(x: number, y: number, value: number, weight: number) {
        let index = y * this.width + x;
        if (this.extraValues[index] && !isNaN(this.extraValues[index])) {
            this.extraValues[index] += value * weight;
        } else {
            this.extraValues[index] = value * weight;
        }
    }

    isEmpty() {
        for (let i = 0; i < this.values.length; i++) {
            if (this.values[i] && !isNaN(this.values[i]))
                return false
        }
        return true
    }

    getValue(x: number, y: number) {
        return this.getValueByIndex(y * this.width + x);
    }

    getValueByIndex(idx: number): number {
        let result = idx >= 0 && idx < this.values.length ? this.values[idx] : 0;
        if (isNaN(result)) {
            return 0.0;
        } else {
            return result;
        }
    }

    getExtraValue(x: number, y: number) {
        return this.getExtraValueByIndex(y * this.width + x);
    }

    getExtraValueByIndex(idx: number): number {
        let result = idx >= 0 && idx < this.extraValues.length ? this.extraValues[idx] : 0;
        if (isNaN(result)) {
            return 0.0;
        } else {
            return result;
        }
    }

    setExtraValueByIndex(idx: number, value: number) {
        if (idx >= 0 && idx < this.extraValues.length) {
            this.extraValues[idx] = value;
        }
    }
}

class Generator {

    gasBlooming: number = 60;
    width: number;
    height: number;

    layers: Array<RenderLayer>

    constructor() {
        this.width = 0;
        this.height = 0;
        this.layers = []
    }

    isValidPoint(x: number, y: number) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    drawStar(renderData: RenderLayer, star: Star, maxBrightness: number, blooming: number) {
        let falloff1 = 3.6 - (blooming / 40.0)
        let falloff2 = 1.2;
        let falloffMin = Math.min(falloff1, falloff2);
        let brightness = star.brightness * maxBrightness * 10;
        let adjustedBrightness = brightness;
        let radius = 0
        while (adjustedBrightness > 0.1 && radius < this.width) {
            radius++;
            adjustedBrightness = adjustedBrightness / falloffMin;
        }
        let center = star.center
        let leftTop = {x: center.x - radius, y: center.y - radius}
        for (let x = leftTop.x; x < leftTop.x + radius * 2; x++) {
            for (let y = leftTop.y; y < leftTop.y + radius * 2; y++) {
                let pt = {x: x, y: y}
                let dist = distanceToPoint(center, pt);
                let b1 = dist === 0 ? brightness : brightness / Math.pow(falloff1, dist)
                let b2 = dist === 0 ? brightness * 2 : brightness * 2 / Math.pow(falloff2, dist)
                if (this.isValidPoint(pt.x, pt.y)) {
                    renderData.addValue(pt.x, pt.y, b1)
                    renderData.addExtraValue(pt.x, pt.y, b2)
                }
            }
        }
    }

    drawBubble(renderData: RenderLayer, bubble: NebulaBubble, nebula: Nebula) {
        let center = bubble.center;
        let radius = Math.round(bubble.radius);
        let fadeInRadius = radius * nebula.innerFade / 100.0;
        let fadeOutRadius = radius * nebula.outerFade / 100.0;
        let hollowEmptyRadius = nebula.generatedRadius * nebula.hollowEmpty / 100.0;
        let hollowFullRadius = nebula.generatedRadius * nebula.hollowFull / 100.0;
        let hue1Radius = nebula.generatedRadius * nebula.hue1Fraction / 100.0;
        let hue2Radius = nebula.generatedRadius * nebula.hue2Fraction / 100.0;
        let pt = {x: center.x - radius, y: center.y - radius}
        let maxX = pt.x + radius * 2;
        let maxY = pt.y + radius * 2;
        let minY = pt.y;
        for (; pt.x < maxX; pt.x++) {
            for (pt.y = minY; pt.y < maxY; pt.y++) {
                let dist = distanceToPoint(center, pt);
                let angleValue = nebula.getAngleValue(pt);
                if (angleValue === 0.0) {
                    continue;
                }
                let totalDist = nebula.getDistanceToPoints(pt);
                if (dist <= radius && this.isValidPoint(pt.x, pt.y)) {
                    let value = 1.0;
                    if (dist < fadeInRadius && fadeInRadius > 0) {
                        value = dist / fadeInRadius;
                    } else if (dist > fadeOutRadius && fadeOutRadius > 0) {
                        value = (radius - dist) / (radius - fadeOutRadius);
                    }
                    if (totalDist < hollowEmptyRadius) {
                        value = 0;
                    } else if (totalDist < hollowFullRadius) {
                        value = value * (totalDist - hollowEmptyRadius) / (hollowFullRadius - hollowEmptyRadius);
                    }
                    value = value * angleValue;
                    renderData.addValue(pt.x, pt.y, value * nebula.brightness);
                    renderData.addExtraValueWithBrightness(pt.x, pt.y, nebula.calcHue(totalDist, hue1Radius, hue2Radius), value * nebula.brightness);
                }
            }
        }
    }

    clearAllLayers() {
        this.layers = [];
    }

    createLayerData(index: number): RenderLayer {
        while (this.layers.length <= index) {
            this.layers.push(new RenderLayer(this.width, this.height));
        }
        this.layers[index].clear();
        return this.layers[index]
    }

    generateOrRender(item: ConfigurableItem) {
        if (item.getType() === ItemType.STARCLUSTER) {
            let cluster = item as Starcluster;
            if (cluster.needsGenerate) {
                // console.log("Generating stars");
                this.generateAndRenderStars(item.id, cluster);
            } else {
                // console.log("Rendering stars");
                this.renderStars(item.id, true);
            }
        } else {
            let nebula = item as Nebula;
            if (nebula.needsGenerate) {
                // console.log("Generating nebulae");
                this.generateAndRenderNebula(item.id, item as Nebula);
            } else {
                // console.log("Rendering nebulae");
                this.renderNebula(item.id, true)
            }
        }
    }

    getData() {
        return new RenderData(this.width, this.height, this.gasBlooming, this.layers);
    }

    generateAndRenderStars(index: number, cluster: Starcluster) {
        let stars = cluster.generateStars();
        let layer = this.createLayerData(index);
        layer.layerType = LayerType.LIGHT;
        layer.cluster = cluster;
        layer.stars = stars;
        this.renderStars(index, false);
    }

    renderStars(index: number, clear: boolean) {
        let layer = this.layers[index];
        if(layer.cluster === null) {
            return;
        }
        if(clear){
            layer.clear();
        }
        let cluster: Starcluster = layer.cluster;
        layer.stars.forEach((star) => {
            this.drawStar(layer, star, cluster.brightness, cluster.blooming)
        });
    }

    generateAndRenderNebula(index: number, nebula: Nebula) {
        let bubbles = nebula.generateNebulae();
        let layer = this.createLayerData(index);
        layer.layerType = LayerType.SATURATION;
        layer.nebula = nebula;
        layer.bubbles = bubbles;
        this.renderNebula(index, false);
    }

    renderNebula(index: number, clear: boolean) {
        let layer = this.layers[index];
        if (layer.nebula === null) {
            return;
        }
        if (clear) {
            layer.clear();
        }
        let nebula: Nebula = layer.nebula;
        layer.bubbles.forEach((bubble) => {
            this.drawBubble(layer, bubble, nebula)
        });
        this.postProcessHue(index);
        if (nebula.smooth > 1) {
            this.smooth(index, nebula.smooth);
        }
    }

    postProcessHue(index: number) {
        let layer = this.layers[index];
        for (let i = 0; i < layer.extraValues.length; i++) {
            let h = layer.getExtraValueByIndex(i) / layer.getValueByIndex(i);
            layer.setExtraValueByIndex(i, h);
        }
    }

    smooth(index: number, value: number) {
        let newLayer = new RenderLayer(this.width, this.height);
        let oldLayer = this.layers[index];
        newLayer.active = oldLayer.active;
        newLayer.layerType = oldLayer.layerType;
        newLayer.bubbles = oldLayer.bubbles;
        newLayer.nebula = oldLayer.nebula;
        newLayer.extraValues = oldLayer.extraValues;
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.width; y++) {
                let newVals = [
                    {"val": oldLayer.getValue(x, y), "wt": this.isValidPoint(x, y) ? 1.0 : 0},

                    {"val": oldLayer.getValue(x - 1, y), "wt": this.isValidPoint(x, y) ? value / 100.0 : 0},
                    {"val": oldLayer.getValue(x, y - 1), "wt": this.isValidPoint(x, y) ? value / 100.0 : 0},
                    {"val": oldLayer.getValue(x+1,y), "wt":this.isValidPoint(x,y)? value/100.0 : 0},
                    {"val": oldLayer.getValue(x,y+1), "wt":this.isValidPoint(x,y)? value/100.0 : 0},

                    {"val": oldLayer.getValue(x-1,y-1), "wt":this.isValidPoint(x,y)? value/141.0 : 0},
                    {"val": oldLayer.getValue(x-1,y+1), "wt":this.isValidPoint(x,y)? value/141.0 : 0},
                    {"val": oldLayer.getValue(x+1,y-1), "wt":this.isValidPoint(x,y)? value/141.0 : 0},
                    {"val": oldLayer.getValue(x + 1, y + 1), "wt": this.isValidPoint(x, y) ? value / 141.0 : 0}
                ]
                let newValue = 0.0;
                let wt = 0.0;
                newVals.forEach((item => {
                    newValue += (item.val * item.wt);
                    wt += item.wt;
                }));
                newLayer.addValue(x, y, newValue / wt);
            }
        }
        this.layers[index] = newLayer;
    }

    setWidth(newWidth: number) {
        this.width = newWidth;
        this.layers.forEach(layer => {
            layer.clear()
        });
    }

    setHeight(newHeight: number) {
        this.height = newHeight;
        this.layers.forEach(layer => {
            layer.clear()
        });
    }

    setGasBlooming(gasBlooming: number) {
        this.gasBlooming = gasBlooming;
    }

}

export {Generator, RenderData, RenderLayer, LayerType}