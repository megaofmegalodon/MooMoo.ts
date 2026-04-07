import Projectile from "../../constants/Projectile";

export const projectiles: Map<number, Projectile> = new Map();

export default class ProjectileManager {
    static add(x: number, y: number, dir: number, range: number, speed: number, indx: number, layer: number, sid: number) {
        const projectile = new Projectile(x, y, dir, range, speed, sid, layer, indx);
        projectiles.set(sid, projectile);
    }

    static remove(sid: number, range: number) {
        const projectile = projectiles.get(sid);
        if (projectile) projectile.range = range;
    }
}