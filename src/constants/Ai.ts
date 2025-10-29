import RendererUtils from "../rendering/RendererUtils";
import randInt from "../utils/randInt";
import EntityManager from "./EntityManager";

export const ais = new EntityManager<Ai>();

export const aiTypes = [{
    id: 0,
    src: "cow_1",
    killScore: 150,
    health: 500,
    weightM: 0.8,
    speed: 0.00095,
    turnSpeed: 0.001,
    scale: 72,
    drop: ["food", 50]
}, {
    id: 1,
    name: "Oink",
    src: "pig_1",
    killScore: 200,
    health: 800,
    weightM: 0.6,
    speed: 0.00085,
    turnSpeed: 0.001,
    scale: 72,
    drop: ["food", 80]
}, {
    id: 2,
    name: "Bull",
    src: "bull_2",
    hostile: true,
    dmg: 20,
    killScore: 1000,
    health: 1800,
    weightM: 0.5,
    speed: 0.00094,
    turnSpeed: 0.00074,
    scale: 78,
    viewRange: 800,
    chargePlayer: true,
    drop: ["food", 100]
}, {
    id: 3,
    name: "Bully",
    src: "bull_1",
    hostile: true,
    dmg: 20,
    killScore: 2000,
    health: 2800,
    weightM: 0.45,
    speed: 0.001,
    turnSpeed: 0.0008,
    scale: 90,
    viewRange: 900,
    chargePlayer: true,
    drop: ["food", 400]
}, {
    id: 4,
    name: "Wolf",
    src: "wolf_1",
    hostile: true,
    dmg: 8,
    killScore: 500,
    health: 300,
    weightM: 0.45,
    speed: 0.001,
    turnSpeed: 0.002,
    scale: 84,
    viewRange: 800,
    chargePlayer: true,
    drop: ["food", 200]
}, {
    id: 5,
    name: "Quack",
    src: "chicken_1",
    dmg: 8,
    killScore: 2000,
    noTrap: true,
    health: 300,
    weightM: 0.2,
    speed: 0.0018,
    turnSpeed: 0.006,
    scale: 70,
    drop: ["food", 100]
}, {
    id: 6,
    name: "MOOSTAFA",
    nameScale: 50,
    src: "enemy",
    hostile: true,
    dontRun: true,
    fixedSpawn: true,
    spawnDelay: 60000,
    noTrap: true,
    colDmg: 100,
    dmg: 40,
    killScore: 8000,
    health: 18000,
    weightM: 0.4,
    speed: 0.0007,
    turnSpeed: 0.01,
    scale: 80,
    spriteMlt: 1.8,
    leapForce: 0.9,
    viewRange: 1000,
    hitRange: 210,
    hitDelay: 1000,
    chargePlayer: true,
    drop: ["food", 100]
}, {
    id: 7,
    name: "Treasure",
    hostile: true,
    nameScale: 35,
    src: "crate_1",
    fixedSpawn: true,
    spawnDelay: 120000,
    colDmg: 200,
    killScore: 5000,
    health: 20000,
    weightM: 0.1,
    speed: 0.0,
    turnSpeed: 0.0,
    scale: 70,
    spriteMlt: 1.0
}, {
    id: 8,
    name: "MOOFIE",
    src: "wolf_2",
    hostile: true,
    fixedSpawn: true,
    dontRun: true,
    hitScare: 4,
    spawnDelay: 30000,
    noTrap: true,
    nameScale: 35,
    dmg: 10,
    colDmg: 100,
    killScore: 3000,
    health: 7000,
    weightM: 0.45,
    speed: 0.0015,
    turnSpeed: 0.002,
    scale: 90,
    viewRange: 800,
    chargePlayer: true,
    drop: ["food", 1000]
}, {
    id: 9,
    name: "💀MOOFIE",
    src: "wolf_2",
    hostile: !0,
    fixedSpawn: !0,
    dontRun: !0,
    hitScare: 50,
    spawnDelay: 6e4,
    noTrap: !0,
    nameScale: 35,
    dmg: 12,
    colDmg: 100,
    killScore: 3e3,
    health: 9e3,
    weightM: .45,
    speed: .0015,
    turnSpeed: .0025,
    scale: 94,
    viewRange: 1440,
    chargePlayer: !0,
    drop: ["food", 3e3],
    minSpawnRange: .85,
    maxSpawnRange: .9
}, {
    id: 10,
    name: "💀Wolf",
    src: "wolf_1",
    hostile: !0,
    fixedSpawn: !0,
    dontRun: !0,
    hitScare: 50,
    spawnDelay: 3e4,
    dmg: 10,
    killScore: 700,
    health: 500,
    weightM: .45,
    speed: .00115,
    turnSpeed: .0025,
    scale: 88,
    viewRange: 1440,
    chargePlayer: !0,
    drop: ["food", 400],
    minSpawnRange: .85,
    maxSpawnRange: .9
}, {
    id: 11,
    name: "💀Bully",
    src: "bull_1",
    hostile: !0,
    fixedSpawn: !0,
    dontRun: !0,
    hitScare: 50,
    dmg: 20,
    killScore: 5e3,
    health: 5e3,
    spawnDelay: 1e5,
    weightM: .45,
    speed: .00115,
    turnSpeed: .0025,
    scale: 94,
    viewRange: 1440,
    chargePlayer: !0,
    drop: ["food", 800],
    minSpawnRange: .85,
    maxSpawnRange: .9
}];

export default class Ai {
    health: number;
    maxHealth: number;

    sid: number = -1;

    deltaTime: number = 0;

    isPlayer: false = false;

    forcePos: boolean = false;
    visible: boolean = false;
    weightM: number;

    dirPlus: number = 0;
    scale: number;

    index: number;
    src: string;

    name?: string;
    dmg: number;

    active: boolean = true;

    x2: number;
    y2: number;

    x1: number;
    y1: number;

    d1: number;
    d2: number;
    spriteMlt: number;
    nameScale: number;

    nameIndex = randInt(0, RendererUtils.cowNames.length - 1);

    constructor(
        public x: number,
        public y: number,
        public dir: number,
        id: number
    ) {
        const data = aiTypes[id];

        this.x1 = this.x2 = x;
        this.y1 = this.y2 = y;

        this.d1 = dir;
        this.d2 = dir;

        this.health = data.health;
        this.maxHealth = data.health;
        this.scale = data.scale;
        this.weightM = data.weightM;

        this.nameScale = data.nameScale ?? 0;

        this.index = id;
        this.src = data.src;

        this.name = data.name;
        this.dmg = data.dmg ?? 0;

        this.dirPlus = 0;
        this.spriteMlt = data.spriteMlt ?? 0;
    }

    animate(delta: number) { }
}