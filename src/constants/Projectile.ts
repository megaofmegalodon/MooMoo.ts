import items from "./items";

export default class Projectile {
    active: boolean = true;
    scale: number;
    src: string;

    dmg: number;

    constructor(
        public x: number,
        public y: number,
        public dir: number,
        public range: number,
        public speed: number,
        public sid: number,
        public layer: number,
        public indx: number
    ) {
        const data = items.projectiles[indx];

        this.scale = data.scale;
        this.src = data.src ?? "";
        this.dmg = data.dmg;
    }

    skipMov: boolean = true;

    update(delta: number) {
        const tmpSpeed = this.speed * delta;

        if (!this.skipMov) {
            this.x += tmpSpeed * Math.cos(this.dir);
            this.y += tmpSpeed * Math.sin(this.dir);
            this.range -= tmpSpeed;

            if (this.range <= 0) {
                this.x += this.range * Math.cos(this.dir);
                this.y += this.range * Math.sin(this.dir);
                this.range = 0;
                this.active = false;
            }
        } else {
            this.skipMov = false;
        }
    }
}