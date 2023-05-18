import {Starcluster, StarClusterType} from "../model/Starcluster";
import {Nebula, NebulaType} from "../model/Nebula";
import {ConfigurableItem} from "../model/ConfigurableItem";
import {Point} from "../model/Point";

function generateSamples() {
    let cluster1 = new Starcluster(0, [{x: 0, y: 0}, {x: 960, y: 720}])
    cluster1.clusterType = StarClusterType.RECTANGULAR;
    cluster1.brightness = 10;
    cluster1.blooming = 30;
    cluster1.nrOfStars = "800";
    let cluster2 = new Starcluster(1, [{x: 80, y: 130}, {x: 315, y: 510}, {x: 880, y: 540}]);
    cluster2.clusterType = StarClusterType.PATH;
    cluster2.minRadius = "50";
    cluster2.maxRadius = "150";
    cluster2.brightness = 35;
    cluster2.blooming = 40;
    cluster2.nrOfStars = "250";
    let nebula1 = new Nebula(2, [{x: 360, y: 240}])
    nebula1.nebulaType = NebulaType.CIRCULAR
    nebula1.nrOfSeeds = "10";
    nebula1.radius = "60"
    nebula1.minSeedRadius = "60"
    nebula1.maxSeedRadius = "100"
    nebula1.hue1 = 180;
    nebula1.hue2 = 180;
    let nebula2 = new Nebula(3, [{x: 360, y: 240}])
    nebula2.nebulaType = NebulaType.CIRCULAR
    nebula2.nrOfSeeds = "10";
    nebula2.radius = "100";
    nebula2.minSeedRadius = "100"
    nebula2.maxSeedRadius = "180"
    nebula2.hue1 = 0;
    nebula2.hue2 = 20;
    nebula2.brightness = 30;
    nebula2.cutOutAngle = 92;
    nebula2.cutOutSize = 30;
    nebula2.cutOutFade = 10;
    nebula2.hollowEmpty = 20;
    nebula2.hollowFull = 35;
    return [cluster1, cluster2, nebula1, nebula2];
}

function generateSamples2() {
    let idx = 0;
    let cluster0 = new Starcluster(idx, [{x: 160, y: 160}])
    cluster0.clusterType = StarClusterType.CIRCULAR;
    cluster0.brightness = 15;
    cluster0.blooming = 5;
    cluster0.minRadius = "150";
    cluster0.maxRadius = "180";
    cluster0.nrOfStars = "1000";
    idx++
    // Heart
    let cluster1 = new Starcluster(idx, [{x: 160, y: 160}])
    cluster1.clusterType = StarClusterType.CIRCULAR;
    cluster1.brightness = 25;
    cluster1.blooming = 15;
    cluster1.minRadius = "15";
    cluster1.maxRadius = "40";
    cluster1.nrOfStars = "150";
    idx++
    // Scutum-Centaurus arm (main arm 1)
    let cluster2 = new Starcluster(idx, [{"x": 170, "y": 133}, {"x": 131, "y": 145}, {"x": 132, "y": 187}, {
        "x": 181,
        "y": 201
    }, {"x": 237, "y": 147}, {"x": 228, "y": 76}, {"x": 162, "y": 37}, {"x": 97, "y": 49}]);
    cluster2.clusterType = StarClusterType.PATH;
    cluster2.minRadius = "5";
    cluster2.maxRadius = "15";
    cluster2.brightness = 15;
    cluster2.blooming = 5;
    cluster2.nrOfStars = "300";
    idx++
    let cluster2a = new Starcluster(idx, [{"x": 97, "y": 49}, {"x": 34, "y": 103}]);
    cluster2a.clusterType = StarClusterType.PATH;
    cluster2a.minRadius = "4";
    cluster2a.maxRadius = "10";
    cluster2a.brightness = 15;
    cluster2a.blooming = 5;
    cluster2a.nrOfStars = "50";
    idx++
    // Perseus arm (main arm 2)
    let cluster3 = new Starcluster(idx, [{"x": 180, "y": 171}, {"x": 185, "y": 135}, {"x": 145, "y": 106}, {
        "x": 91,
        "y": 142
    }, {"x": 93, "y": 211}, {"x": 142, "y": 260}, {"x": 217, "y": 270}]);
    cluster3.clusterType = StarClusterType.PATH;
    cluster3.minRadius = "5";
    cluster3.maxRadius = "15";
    cluster3.brightness = 15;
    cluster3.blooming = 5;
    cluster3.nrOfStars = "300";
    idx++
    let cluster3a = new Starcluster(idx, [{"x": 217, "y": 270}, {"x": 274, "y": 237}]);
    cluster3a.clusterType = StarClusterType.PATH;
    cluster3a.minRadius = "4";
    cluster3a.maxRadius = "10";
    cluster3a.brightness = 15;
    cluster3a.blooming = 5;
    cluster3a.nrOfStars = "50";
    idx++
    // Outer arm
    let cluster4 = new Starcluster(idx, [{"x": 207, "y": 120}, {"x": 174, "y": 73}, {"x": 129, "y": 69}, {
        "x": 84,
        "y": 97
    }, {"x": 41, "y": 166}, {"x": 75, "y": 270}, {"x": 168, "y": 313}, {"x": 256, "y": 311}, {
        "x": 324,
        "y": 251
    }, {"x": 323, "y": 150}]);
    cluster4.clusterType = StarClusterType.PATH;
    cluster4.minRadius = "4";
    cluster4.maxRadius = "10";
    cluster4.brightness = 12;
    cluster4.blooming = 5;
    cluster4.nrOfStars = "200";
    idx++;
    // ?? arm
    let cluster5 = new Starcluster(idx, [{"x": 172, "y": 215}, {"x": 222, "y": 210}, {"x": 278, "y": 158}, {
        "x": 280,
        "y": 96
    }, {"x": 251, "y": 43}, {"x": 205, "y": 15}, {"x": 108, "y": 13}]);
    cluster5.clusterType = StarClusterType.PATH;
    cluster5.minRadius = "4";
    cluster5.maxRadius = "10";
    cluster5.brightness = 12;
    cluster5.blooming = 5;
    cluster5.nrOfStars = "160";
    idx++
    // Orion Spur
    let cluster6 = new Starcluster(idx, [{"x": 141, "y": 203}, {"x": 155, "y": 231}, {"x": 180, "y": 245}]);
    cluster6.clusterType = StarClusterType.PATH;
    cluster6.minRadius = "4";
    cluster6.maxRadius = "8";
    cluster6.brightness = 9;
    cluster6.blooming = 4;
    cluster6.nrOfStars = "60";
    idx++
    let b1 = 15;
    let b2 = 40;
    let maxFract = "0.9"
    let nebula1 = new Nebula(idx, [{x: 160, y: 160}])
    nebula1.nebulaType = NebulaType.CIRCULAR;
    nebula1.brightness = b2;
    nebula1.hue1 = 20;
    nebula1.hue2 = 20;
    nebula1.radius = "30";
    nebula1.minSeedRadius = "8";
    nebula1.maxSeedRadius = "12";
    idx++
    let nebula2 = new Nebula(idx, [...cluster2.points, cluster2a.points[1]]);
    nebula2.nebulaType = NebulaType.PATH;
    nebula2.brightness = b1;
    nebula2.nrOfSeeds = "150";
    nebula2.radius = "40";
    nebula2.minSeedRadius = "15";
    nebula2.maxSeedRadius = "25";
    nebula2.minRadiusPart = "0.5";
    nebula2.maxRadiusPart = maxFract;
    nebula2.hue1 = 210;
    nebula2.hue2 = 210;
    idx++
    let nebula3 = new Nebula(idx, [...cluster3.points, cluster3a.points[1]]);
    nebula3.nebulaType = NebulaType.PATH;
    nebula3.brightness = b1;
    nebula3.nrOfSeeds = "150";
    nebula3.radius = "40";
    nebula3.minSeedRadius = "15";
    nebula3.maxSeedRadius = "25";
    nebula3.minRadiusPart = "0.5";
    nebula3.maxRadiusPart = maxFract;
    nebula3.hue1 = 210;
    nebula3.hue2 = 210;
    idx++
    let nebula4 = new Nebula(idx, [...cluster4.points]);
    nebula4.nebulaType = NebulaType.PATH;
    nebula4.brightness = b1;
    nebula4.nrOfSeeds = "200";
    nebula4.radius = "25";
    nebula4.minSeedRadius = "15";
    nebula4.maxSeedRadius = "25";
    nebula4.minRadiusPart = "0.5";
    nebula4.maxRadiusPart = maxFract;
    nebula4.hue1 = 215;
    nebula4.hue2 = 215;
    idx++
    let nebula5 = new Nebula(idx, [...cluster5.points]);
    nebula5.nebulaType = NebulaType.PATH;
    nebula5.brightness = b1;
    nebula5.nrOfSeeds = "200";
    nebula5.radius = "25";
    nebula5.minSeedRadius = "15";
    nebula5.maxSeedRadius = "25";
    nebula5.minRadiusPart = "0.5";
    nebula5.maxRadiusPart = maxFract;
    nebula5.hue1 = 215;
    nebula5.hue2 = 215;
    idx++
    let samples = [cluster0, cluster1, cluster2, cluster2a, cluster3, cluster3a, cluster4, cluster5, cluster6, nebula1, nebula2, nebula3, nebula4, nebula5];
    samples.forEach((item) => {
        item.points = item.points.map((pt) => {
            return {x: pt.x + 20, y: pt.y + 20}
        })
    });
    // [nebula2, nebula3, nebula4, nebula5].forEach((nebula) =>{
    //     let redNebula = nebula.copy();
    //     redNebula.id = idx;
    //     idx++;
    //     redNebula.hue1 = 0;
    //     redNebula.hue2 = 0;
    //     redNebula.radius = "5"
    //     redNebula.nrOfSeeds = "30";
    //     redNebula.minSeedRadius = "7";
    //     redNebula.maxSeedRadius = "10";
    //     redNebula.brightness = b2;
    //     redNebula.innerFade = 0;
    //     redNebula.outerFade = 0;
    //     samples.push(redNebula)
    // })
    return samples;
}

function generateSamples3() {
    var idx = 0;
    let cluster1 = new Starcluster(idx, [{x: 0, y: 0}, {x: 712, y: 410}])
    cluster1.clusterType = StarClusterType.RECTANGULAR;
    cluster1.brightness = 10;
    cluster1.blooming = 10;
    cluster1.nrOfStars = "2000";
    idx++;
    let b = 35;
    let bl = 10;
    let cluster2 = new Starcluster(idx, [{x: 0, y: 0}, {x: 111, y: 19}, {x: 294, y: 202}, {x: 675, y: 358}]);
    cluster2.clusterType = StarClusterType.PATH;
    cluster2.minRadius = "50";
    cluster2.maxRadius = "100";
    cluster2.brightness = b;
    cluster2.blooming = bl;
    cluster2.nrOfStars = "600";
    idx++;
    let cluster3 = new Starcluster(idx, [{x: 5, y: 320}, {x: 325, y: 385}, {x: 635, y: 405}]);
    cluster3.clusterType = StarClusterType.PATH;
    cluster3.minRadius = "50";
    cluster3.maxRadius = "80";
    cluster3.brightness = b;
    cluster3.blooming = bl;
    cluster3.nrOfStars = "300";
    idx++;
    let cluster4 = new Starcluster(idx, [{x: 163, y: 9}, {x: 491, y: 24}, {x: 700, y: 55}]);
    cluster4.clusterType = StarClusterType.PATH;
    cluster4.minRadius = "50";
    cluster4.maxRadius = "80";
    cluster4.brightness = b;
    cluster4.blooming = bl;
    cluster4.nrOfStars = "300";
    idx++;

    let samples: Array<ConfigurableItem> = [cluster1, cluster2, cluster3, cluster4];

    [cluster2, cluster3, cluster4].forEach((cluster) => {
        let nebula = new Nebula(idx, cluster.points);
        nebula.nebulaType = NebulaType.PATH;
        nebula.nrOfSeeds = "" + parseInt(cluster.nrOfStars) / 15;
        nebula.brightness = 50
        nebula.radius = parseInt(cluster.nrOfStars) > 300 ? "50" : "35";
        idx++;
        samples.push(nebula);
    });

    let nebula = new Nebula(idx, [{x: 1, y: 1}]);
    nebula.nebulaType = NebulaType.CIRCULAR;
    nebula.nrOfSeeds = "5";
    nebula.brightness = 50
    nebula.hue1 = 0;
    nebula.hue2 = 0;
    idx++;
    samples.push(nebula);

    let nebula2 = new Nebula(idx, [{x: 711, y: 409}]);
    nebula2.nebulaType = NebulaType.CIRCULAR;
    nebula2.nrOfSeeds = "5";
    nebula2.brightness = 50
    nebula2.hue1 = 0;
    nebula2.hue2 = 0;
    idx++;
    samples.push(nebula2);

    return samples;
}

function generateSamples4() {
    var idx = 0;
    let cluster1 = new Starcluster(idx, [{x: 0, y: 0}, {x: 1024, y: 768}])
    cluster1.clusterType = StarClusterType.RECTANGULAR;
    cluster1.brightness = 10;
    cluster1.blooming = 10;
    cluster1.nrOfStars = "3000";
    idx++;
    let b = 35;
    let bl = 10;
    let cluster2 = new Starcluster(idx, [{x: 250, y: 0}, {x: 450, y: 360}]);
    cluster2.clusterType = StarClusterType.PATH;
    cluster2.minRadius = "100";
    cluster2.maxRadius = "500";
    cluster2.brightness = b;
    cluster2.blooming = bl;
    cluster2.nrOfStars = "1000";
    idx++;

    let samples: Array<ConfigurableItem> = [cluster1, cluster2];

    [cluster2].forEach((cluster) => {
        let nebula = new Nebula(idx, cluster.points);
        nebula.nebulaType = NebulaType.PATH;
        nebula.nrOfSeeds = "10"
        nebula.brightness = 30
        nebula.radius = "100";
        idx++;
        samples.push(nebula);
    });

    // let nebula = new Nebula(idx, [{x: 1, y: 1}]);
    // nebula.nebulaType = NebulaType.CIRCULAR;
    // nebula.nrOfSeeds = "5";
    // nebula.brightness = 50
    // nebula.hue1 = 0;
    // nebula.hue2 = 0;
    // idx++;
    // samples.push(nebula);
    //
    // let nebula2 = new Nebula(idx, [{x: 711, y: 409}]);
    // nebula2.nebulaType = NebulaType.CIRCULAR;
    // nebula2.nrOfSeeds = "5";
    // nebula2.brightness = 50
    // nebula2.hue1 = 0;
    // nebula2.hue2 = 0;
    // idx++;
    // samples.push(nebula2);

    return samples;
}

export {generateSamples, generateSamples2, generateSamples3, generateSamples4}