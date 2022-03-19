import {Starcluster, StarClusterType} from "../model/Starcluster";
import {Nebula, NebulaType} from "../model/Nebula";

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

export {generateSamples}