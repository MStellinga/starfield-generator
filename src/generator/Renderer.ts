import {hslToRgb} from "../util/colorUtil";
import {LayerType, RenderData, RenderLayer} from "./Generator";

class Renderer {

    width: number = 0;
    height: number = 0;
    gasBlooming: number = 0;
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
        let imageData = context.createImageData(this.width, this.height);
        let starLayers = this.layers.filter((layer) => {
            return layer.layerType === LayerType.LIGHT && layer.active
        });
        let nebulaLayers = this.layers.filter((layer) => {
            return layer.layerType === LayerType.SATURATION && layer.active
        });
        console.log(`Creating image ${this.width}x${this.height} with ${starLayers.length} star layers and ${nebulaLayers.length} nebula layers.`);
        for (let i = 0; i < imageData.data.length; i += 4) {
            let l1 = 0.0;
            let l2 = 0.0;
            let r = 0;
            let g = 0;
            let b = 0;
            let blooming = this.gasBlooming;
            let colorCount = 0;
            starLayers.forEach(layer => {
                l1 += layer.getValueByIndex(i / 4);
                l2 += layer.getExtraValueByIndex(i / 4);
                if (nebulaLayers.length === 0) {
                    let rgb = hslToRgb(0.0, 0.0, l1 / 100.0);
                    r += rgb[0];
                    g += rgb[1];
                    b += rgb[2];
                    colorCount++
                }
            })
            nebulaLayers.forEach(layer => {
                let s = layer.getValueByIndex(i / 4);
                if (s > 0 || l1 > 0) {
                    let h = layer.getExtraValueByIndex(i / 4);
                    let l = l1;
                    if (s > 0) {
                        l += blooming / 200 * Math.sqrt(l2) + s / 20;
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

export {Renderer}