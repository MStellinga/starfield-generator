import {hslToRgb} from "../util/colorUtil";
import {LayerType, RenderData, RenderLayer} from "./Generator";

class Renderer {

    width: number = 0;
    height: number = 0;
    gasBlooming: number = 0;
    transparency: boolean = false
    layers: Array<RenderLayer> = [];

    updateData(data: RenderData) {
        this.width = data.width;
        this.height = data.height;
        this.gasBlooming = data.gasBlooming;
        this.layers = data.layers;
    }

    paint(context: CanvasRenderingContext2D | null) {
        if (context === null) {
            return;
        }
        if (this.width == 0 || this.height == 0) {
            return;
        }
        let imageData = context.createImageData(this.width, this.height);
        let starLayers = this.layers.filter((layer) => {
            return layer.layerType === LayerType.LIGHT
        });
        let nebulaLayers = this.layers.filter((layer) => {
            return layer.layerType === LayerType.SATURATION && layer.active
        });
        // console.log(`Creating image ${this.width}x${this.height} with ${starLayers.length} star layers and ${nebulaLayers.length} nebula layers.`);
        for (let i = 0; i < imageData.data.length; i += 4) {
            let l1 = 0.0;
            let l2 = 0.0;
            let r = 0;
            let g = 0;
            let b = 0;
            let blooming = this.gasBlooming;
            let colorCount = 0;
            let lInActive = 0.0;
            starLayers.forEach(layer => {
                if (nebulaLayers.length === 0 && !layer.active) {
                    return;
                }
                l1 += layer.getValueByIndex(i / 4);
                lInActive += layer.active ? 0.0 : l1;
                l2 += layer.getExtraValueByIndex(i / 4);
                if (nebulaLayers.length === 0) {
                    let rgb = hslToRgb(0.0, 0.0, l1 / 100.0);
                    r += rgb[0];
                    g += rgb[1];
                    b += rgb[2];
                    colorCount++
                }
            })
            if (l1 === 0) {
                l1 = 0.001;
            }
            nebulaLayers.forEach(layer => {
                let s = layer.getValueByIndex(i / 4);
                if (s > 0 || l1 > 0) {
                    let l = l1 - lInActive * 0.9;
                    let h = layer.getExtraValueByIndex(i / 4);
                    if (s > 0) {
                        l += (blooming / 200) * Math.sqrt(l2) + s / 20;
                    }
                    if (s > 100) {
                        s = 100;
                    }
                    l = l * 0.8;
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

            r = r / colorCount;
            g = g / colorCount;
            b = b / colorCount;
            let a = 255;
            if (this.transparency) {
                a = Math.max(r, g, b);
                r = r / a * 255;
                g = g / a * 255;
                b = b / a * 255;
            }
            imageData.data[i] = r;
            imageData.data[i + 1] = g;
            imageData.data[i + 2] = b;
            imageData.data[i + 3] = a;
        }
        context.putImageData(imageData, 0, 0);
    }

}

export {Renderer}