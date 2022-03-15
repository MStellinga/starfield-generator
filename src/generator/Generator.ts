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
    hue: number;
    values: Array<number>
    type: LayerType

    nebula: Nebula | null;
    bubbles: Array<NebulaBubble>;

    cluster: Starcluster | null;
    stars: Array<Star>;
    hdr = 0.0;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.type = LayerType.LIGHT;
        this.hue = 0;
        this.values = [];
        this.bubbles = []
        this.stars = [];
        this.nebula = null;
        this.cluster = null;
    }

    clear() {
        this.values = new Array(this.width * this.height);
    }

    addValue(x: number, y: number, value: number) {
        let index = y * this.width + x;
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
}

class Generator {

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
        let falloff = 3.6 - (blooming / 40.0)
        let brightness = star.brightness * maxBrightness * 10;
        let adjustedBrightness = brightness / 2.0;
        let radius = 0
        while (adjustedBrightness > 0.5 && radius < this.width) {
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
                if (this.isValidPoint(pt.x, pt.y)) {
                    renderData.addValue(pt.x, pt.y, b)
                }
            }
        }
    }

    drawBubble(renderData: RenderData, nebula: NebulaBubble, fadeIn: number, fadeOut: number, brightness: number) {
        let center = nebula.center;
        let radius = Math.round(nebula.radius);
        let fadeInRadius = radius * fadeIn / 100.0;
        let fadeOutRadius = radius * fadeOut / 100.0;
        let leftTop = {x: center.x - radius, y: center.y - radius}
        for (let x = leftTop.x; x < leftTop.x + radius * 2; x++) {
            for (let y = leftTop.y; y < leftTop.y + radius * 2; y++) {
                let pt = {x: x, y: y}
                let dist = distanceToPoint(center, pt);
                if (dist <= radius && this.isValidPoint(pt.x,pt.y)) {
                    let value = 1.0;
                    if (dist < fadeInRadius && fadeInRadius > 0) {
                        value = dist / fadeInRadius;
                    } else if (dist > fadeOutRadius && fadeOutRadius > 0) {
                        value = (radius - dist) / (radius - fadeOutRadius);
                    }

                    renderData.addValue(pt.x, pt.y, value * brightness)
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
            if(cluster.needsGenerate) {
                // console.log("Generating stars");
                this.generateAndRenderStars(item.id, cluster);
            } else if(cluster.needsRender){
                // console.log("Rendering stars");
                this.renderStars(item.id, true);
            }
        } else {
            let nebula = item as Nebula;
            if(nebula.needsGenerate) {
                // console.log("Generating nebulae");
                this.generateAndRenderNebula(item.id, item as Nebula);
            } else if(nebula.needsRender){
                // console.log("Rendering nebulae");
                this.renderNebula(item.id, true)
            } else {
                this.layers[item.id].hue = nebula.hue;
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
        cluster.needsRender = false;
    }

    generateAndRenderNebula(index: number, nebula: Nebula) {
        let bubbles = nebula.generateNebulae();
        let layer = this.createLayerData(index);
        layer.hue = nebula.hue;
        layer.type = LayerType.SATURATION;
        layer.nebula = nebula;
        layer.bubbles = bubbles;
        this.renderNebula(index, false);
    }

    renderNebula(index: number, clear: boolean) {
        let layer = this.layers[index];
        if(layer.nebula === null) {
            return;
        }
        if(clear){
            layer.clear();
        }
        let nebula: Nebula = layer.nebula;
        layer.bubbles.forEach((bubble) => {
            this.drawBubble(layer, bubble, nebula.innerFade, nebula.outerFade, nebula.brightness)
        });
        this.smooth(index,nebula.smooth);
        nebula.needsRender = false;
    }

    smooth(index: number, value: number) {
        let newLayer = new RenderData(this.width, this.height);
        let oldLayer = this.layers[index];
        newLayer.type = oldLayer.type;
        newLayer.hue = oldLayer.hue;
        newLayer.bubbles = oldLayer.bubbles;
        newLayer.nebula = oldLayer.nebula;
        for(let x=0; x<this.width; x++){
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
                    {"val": oldLayer.getValue(x+1,y+1), "wt":this.isValidPoint(x,y)? value/141.0 : 0}
                ]
                let newValue = 0.0;
                let wt = 0.0;
                newVals.forEach((item => { newValue += (item.val * item.wt);wt += item.wt; }));
                newLayer.addValue(x, y, newValue/wt);
            }
        }
        this.layers[index] = newLayer;
    }

    paint(context: CanvasRenderingContext2D | null) {
        if (context === null) {
            return;
        }
        let imageData = context.createImageData(this.width, this.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
            let h = 0.0;
            let s = 0.0;
            let l = 0.0;
            this.layers.forEach(layer => {
                let value = layer.getValueByIndex(i / 4);
                if (layer.type === LayerType.SATURATION) {
                    h += layer.hue;
                    s += value;
                    l += s / 10;
                } else {
                    l += value;
                }
            });
            if (l > 100) {
                l = 100;
            }
            let rgb = hslToRgb(h / 360.0, s / 100.0, l / 100.0);
            // if(s > 0) {
            //     console.log(`(${h},${s},${l}) -> (${rgb[0]},${rgb[1]},${rgb[2]})`)
            // }
            imageData.data[i] = rgb[0];
            imageData.data[i + 1] = rgb[1];
            imageData.data[i + 2] = rgb[2];
            imageData.data[i + 3] = 255;
        }
        context.putImageData(imageData, 0, 0);
    }
}

export {Generator}