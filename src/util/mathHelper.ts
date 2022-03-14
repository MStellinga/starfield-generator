import {Point} from "../model/Point";

function generateRandomPointInCircle(center: Point, radius: number) {
    let distance = Math.random() * radius
    let angle = Math.random() * Math.PI * 2;
    let x = Math.round(center.x + Math.cos(angle) * distance)
    let y = Math.round(center.y + Math.sin(angle) * distance)
    return {x: x, y: y}
}

function generateRandomPointInRect(xLeft: number, yTop: number, width: number, height: number) {
    let x = Math.round(xLeft + Math.random() * width);
    let y = Math.round(yTop + Math.random() * height);
    return {x: x, y: y}
}

function generateRandomPointAlongPath(points: Array<Point>, left: number, top: number, width: number, height: number, radius: number) {
    let attempt = 0;
    // Make a 1000 attempts to create a star in range. In general, around 2 attempts should suffice
    while (attempt < 100) {
        let x = Math.round(left + Math.random() * width);
        let y = Math.round(top + Math.random() * height);
        // Now check if point in range
        for (let i = 1; i < points.length; i++) {
            let v = points[i - 1];
            let w = points[i];
            let distance = distanceToLine({x: x, y: y}, v, w)
            if (distance < radius) {
                return {x: x, y: y}
            }
        }
        attempt++
    }
    if (attempt > 10) {
        console.log(attempt)
    }
    // fallback
    return {x: left, y: top}
}

function distance2(v: Point, w: Point) {
    return Math.pow((v.x - w.x), 2) + Math.pow((v.y - w.y), 2)
}

function distToLine2(p: Point, v: Point, w: Point) {
    let l2 = distance2(v, w);
    if (l2 === 0) {
        return distance2(p, v);
    }
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return distance2(p, {x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y)});
}

function distanceToLine(p: Point, v: Point, w: Point) {
    return Math.sqrt(distToLine2(p, v, w));
}

function distanceToPoint(point: Point, point2: Point) {
    return Math.sqrt(distance2(point, point2))
}

function toRange(value: number, low: number, high: number = -1) {
    if (value < low) {
        return low;
    }
    if (high !== -1 && value > high) {
        console.log(high)
        return high;
    }
    return Math.round(value)
}

export {
    distanceToLine,
    distanceToPoint,
    toRange,
    generateRandomPointAlongPath,
    generateRandomPointInRect,
    generateRandomPointInCircle
}