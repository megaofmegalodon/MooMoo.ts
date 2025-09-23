import items from "./items";

export default class GameObject {

    sid: number = -1;

    name: string;
    id: number;

    xWiggle: number = 0;
    yWiggle: number = 0;

    active: boolean = true;

    blocker: number;
    layer: number = 0;

    isItem: boolean;

    ignoreCollision: boolean;
    hideFromEnemy: boolean;

    dmg: number;
    pDmg: number;
    projDmg: boolean;
    colDiv: number;

    trap: boolean;
    zIndex: number;

    pps: number;
    turnSpeed: number;

    healCol: number;
    teleport: boolean;
    boostSpeed: number;
    projectile: number;
    shootRange: number;
    shootRate: number;
    spawnPoint: boolean;

    ownerSID: number | undefined;

    isGameObject: true = true;

    health: number;
    maxHealth: number;

    constructor(
        public x: number,
        public y: number,
        public dir: number,
        public scale: number,
        public type: number,
        itemId: number,
        ownerSID?: number
    ) {
        const data = items.list[itemId] || {};
        const group = data.group;

        this.layer = 2;

        if (group) {
            this.layer = group.layer;
        } else if (this.type === 0) {
            this.layer = 3;
        } else if (this.type === 2) {
            this.layer = 0;
        } else if (this.type === 4) {
            this.layer = -1;
        }

        this.ownerSID = ownerSID;

        this.isItem = typeof itemId === "number";

        this.id = data.id!;
        this.blocker = data.blocker ?? 0;

        this.health = data.health ?? 0;
        this.maxHealth = data.health ?? 0;

        this.name = data.name ?? "";
        this.colDiv = data.colDiv ?? 1;
        this.ignoreCollision = data.ignoreCollision ?? false;
        this.hideFromEnemy = data.hideFromEnemy ?? false;
        this.projDmg = data.projDmg ?? false;
        this.dmg = data.dmg ?? 0;
        this.pDmg = data.pDmg ?? 0;
        this.pps = data.pps ?? 0;
        this.zIndex = data.zIndex ?? 0;
        this.turnSpeed = data.turnSpeed ?? 0;
        this.trap = data.trap ?? false;
        this.healCol = data.healCol ?? 0;
        this.teleport = data.teleport ?? false;
        this.boostSpeed = data.boostSpeed ?? 0;
        this.projectile = data.projectile ?? -1;
        this.shootRange = data.shootRange ?? 0;
        this.shootRate = data.shootRate ?? 0;
        this.spawnPoint = data.spawnPoint ?? false;
    }

    private static typeIds = new Set([2, 3, 4]);

    getScale(sM = 1, ig = false): number {
        const isSimpleItem = this.isItem || GameObject.typeIds.has(this.type);
        const baseScale = this.scale * (isSimpleItem ? 1 : 0.6 * sM);

        return ig ? baseScale : baseScale * this.colDiv;
    }

    update(delta: number) {
        if (this.xWiggle) this.xWiggle *= Math.pow(0.99, delta);
        if (this.yWiggle) this.yWiggle *= Math.pow(0.99, delta);
        if (this.turnSpeed) this.dir += this.turnSpeed * delta;
    }
}