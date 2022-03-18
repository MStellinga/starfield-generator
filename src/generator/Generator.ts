import {Star, Starcluster} from "../model/Starcluster";
import {distanceToPoint} from "../util/mathHelper";
import {Nebula, NebulaBubble} from "../model/Nebula";
import {hslToRgb} from "../util/colorUtil";
import {ConfigurableItem, ItemType} from "../model/ConfigurableItem";

enum LayerType {
    SATURATION,
    LIGHT
}

class RenderData {

    width: number;
    height: number;
    values: Array<number> = [];
    extraValues: Array<number> = [];
    type: LayerType = LayerType.LIGHT

    nebula: Nebula | null = null;
    bubbles: Array<NebulaBubble> = [];

    cluster: Starcluster | null = null;
    stars: Array<Star> = [];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
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

    addExtraValue(x: number, y: number, value: number) {
        let index = y * this.width + x;
        if (this.extraValues[index] && !isNaN(this.extraValues[index])) {
            this.extraValues[index] += value;
        } else {
            this.extraValues[index] = value;
        }
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

    layers: Array<RenderData>


    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.layers = []
    }

    isValidPoint(x:number, y:number) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    drawStar(renderData: RenderData, star: Star, maxBrightness: number, blooming: number) {
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

    drawBubble(renderData: RenderData, bubble: NebulaBubble, nebula: Nebula) {
        let center = bubble.center;
        let radius = Math.round(bubble.radius);
        let fadeInRadius = radius * nebula.innerFade / 100.0;
        let fadeOutRadius = radius * nebula.outerFade / 100.0;
        let hollowEmptyRadius = nebula.generatedRadius * nebula.hollowEmpty / 100.0;
        let hollowFullRadius = nebula.generatedRadius * nebula.hollowFull / 100.0;
        let hue1Radius = nebula.generatedRadius * nebula.hue1Fraction / 100.0;
        let hue2Radius = nebula.generatedRadius * nebula.hue2Fraction / 100.0;
        let leftTop = {x: center.x - radius, y: center.y - radius}
        for (let x = leftTop.x; x < leftTop.x + radius * 2; x++) {
            for (let y = leftTop.y; y < leftTop.y + radius * 2; y++) {
                let pt = {x: x, y: y}
                let dist = distanceToPoint(center, pt);
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
                    renderData.addValue(pt.x, pt.y, value * nebula.brightness);
                    renderData.addExtraValueWithBrightness(pt.x, pt.y, nebula.calcHue(totalDist, hue1Radius, hue2Radius), value * nebula.brightness);
                }
            }
        }
    }

    clearAllLayers() {
        this.layers = [];
    }

    createLayerData(index: number): RenderData {
        while (this.layers.length <= index) {
            this.layers.push(new RenderData(this.width, this.height));
        }
        this.layers[index].clear();
        return this.layers[index]
    }

    generateOrRender(item: ConfigurableItem){
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

    generateAndRenderStars(index: number, cluster: Starcluster) {
        let stars = cluster.generateStars();
        let layer = this.createLayerData(index);
        layer.type = LayerType.LIGHT;
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
        layer.type = LayerType.SATURATION;
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
        let newLayer = new RenderData(this.width, this.height);
        let oldLayer = this.layers[index];
        newLayer.type = oldLayer.type;
        newLayer.bubbles = oldLayer.bubbles;
        newLayer.nebula = oldLayer.nebula;
        newLayer.extraValues = oldLayer.extraValues;
        for (let x = 0; x < this.width; x++) {
            for(let y=0; y<this.width; y++){
                let newVals = [
                    {"val": oldLayer.getValue(x,y), "wt": this.isValidPoint(x,y)? 1.0 : 0},

                    {"val": oldLayer.getValue(x-1,y), "wt":this.isValidPoint(x,y)? value/100.0 : 0},
                    {"val": oldLayer.getValue(x,y-1), "wt":this.isValidPoint(x,y)? value/100.0 : 0},
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

    setSize(newWidth: number, newHeight: number) {
        this.width = newWidth;
        this.height = newHeight;
        this.layers.forEach(layer => {
            layer.clear()
        });
    }

    paint(context: CanvasRenderingContext2D | null) {
        if (context === null) {
            return;
        }
        let imageData = context.createImageData(this.width, this.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
            // let h = 0.0;
            // let s = 0.0;
            let l1 = 0.0;
            let l2 = 0.0;
            let r = 0;
            let g = 0;
            let b = 0;
            let colorCount = 0;
            this.layers.filter((layer) => {
                return layer.type === LayerType.LIGHT && layer.cluster?.active
            }).forEach(layer => {
                l1 += layer.getValueByIndex(i / 4);
                l2 += layer.getExtraValueByIndex(i / 4);
            })
            this.layers.filter((layer) => {
                return layer.type === LayerType.SATURATION && layer.nebula?.active
            }).forEach(layer => {
                let s = layer.getValueByIndex(i / 4);
                if (s > 0 || l1 > 0) {
                    let h = layer.getExtraValueByIndex(i / 4);
                    let l = l1;
                    if (s > 0) {
                        l += this.gasBlooming / 200 * Math.sqrt(l2) + s / 20;
                    }
                    if (s > 100) {
                        s = 100;
                    }
                    if (l > 100) {
                        l = 100;
                    }
                    let rgb = hslToRgb(h / 360.0, s / 100.0, l / 100.0);
                    r += rgb[0];
                    g += rgb[1];
                    b += rgb[2];
                    colorCount++
                }
            });

            imageData.data[i] = r / colorCount;
            imageData.data[i + 1] = g / colorCount;
            imageData.data[i + 2] = b / colorCount;
            imageData.data[i + 3] = 255;
        }
        context.putImageData(imageData, 0, 0);
    }
}

export {Generator}